from flask import Flask,request,jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
from enum import Enum
from threading import Semaphore
import random
from queue import Queue
from queue import Empty

# time slices shouldn't be more than 20 seconds
time_slice = 5 # default: 5 seconds

# total memory size 
memory_size = 64 # default 64 kB
available_memory = [memory_size]


# only 1 thread allowed to access the "processor" at a time
processor = Semaphore(1)

# only 1 thread allowed to send a message at one time
messanger = Semaphore(1)

# only 1 thread allowed to update memory at a time
mem = Semaphore(1)

# used for checking next process within ready queue and accessing processor function
lock = threading.Lock()

# valid states of all the processes
class State(Enum):
    NEW = 1
    READY = 2
    RUNNING = 3
    EXIT = 4
    BLOCKED = 5
    BLOCK_SUS = 6
    READY_SUS = 7

# valid IO Status states for all processes
class IOStatus(Enum):
    WAITING = 1
    NONE = 2

# Contains processes to be processed by the model
processes = []

# Process threads
threads_proc = []

# Ready queue for processes waiting to be executed
ready = Queue(maxsize = len(processes))

# Updates value of remaining memory
def mod_mem(num):
    available_memory.append(num)
    available_memory.pop(0)

# Controls processes based on what state they are in
def manager(process):
    # While a process is currently running 
    while process["state"] != State.EXIT.name:
        # NEW
        if process["state"] == State.NEW.name:
                while process["state"] == State.NEW.name:
                    # Check available memory size is greater than or equal to current process before admitting
                    if available_memory[0] >= process["size"]:

                        # decrease available memory and change process to ready
                        with mem:
                            mod_mem(available_memory[0] - process["size"])
                        process["state"] = State.READY.name

                        # add process to ready queue
                        ready.put(process)

                        with messanger:
                            print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                            print("process {} changed to ready. available memory: {}".format(process["pid"],available_memory))
                
                    else:
                        if num_blocked() > 0:
                            # Free up space in main memory by suspending a process 
                            if suspend_a_blocked_process(process):
                                # decrease available memory
                                with mem:
                                    mod_mem(available_memory[0] - process["size"])

                                # change process state
                                process["state"] = State.READY.name

                                # add process to ready queue
                                ready.put(process)

                                with messanger:
                                    print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                                    print("process {} changed to ready".format(process["pid"]))
                                    print("available memory: {}".format(available_memory))
                            else:
                                with messanger:
                                    print("process {} added to ready/sus: {}".format(process["pid"]))
                                process["state"] = State.READY_SUS.name
                                send_processes()
                                break
                        else:
                            with messanger:
                                print("process {} added to ready/sus".format(process["pid"]))
                            process["state"] = State.READY_SUS.name
                            send_processes()
                            break

                            
                            
                    # Send message to the frontend with new update
                    send_processes()

        # READY => RUNNING
        if process["state"] == State.READY.name:
            # Process cannot run yet
            run = False
            while process["state"] == State.READY.name:
                with lock:
                    try:
                        # check if next process in the ready queue is ready
                        nextp = ready.get()
                        while nextp["state"] != State.READY.name:
                            nextp = ready.get()
                    except Empty:
                        run = True
                        print("Queue is empty")
                    # if the next process that can be run is the current process, then update run variable
                    if nextp["pid"] == process["pid"] or run:
                        run = True
                    else:
                        # place item back in the front of the queue
                        putBack(nextp)

                # if the process can run
                if run:
                    # check if process has time left to run
                    if process["duration"] == 0:
                        process["state"] = State.EXIT.name
                        with mem:
                            # increase availble memory
                            mod_mem(available_memory[0] + process["size"])

                        with messanger:
                            print("process {} exiting".format(process["pid"]))
                        send_processes()
                        return True
                    # claim control over processor
                    with lock:
                        # change state
                        process["state"] = State.RUNNING.name
                        send_processes() # Send message to the frontend with new update
                        processor.acquire() # semWait()
                        running(process)
                        processor.release() # semSignal()
                    ready.task_done()
                    with messanger:
                        print("process {} back from running. Ready queue: {}".format(process["pid"], list(ready.queue)))
                    break
                else:
                    continue
            
        
        # BLOCKED AND BLOCKED/SUSPEND
        if process["state"] == State.BLOCKED.name:
            # create threads for each queue (can only open a maximum of 3 at a time)
            q1 = threading.Thread(target = blocked, args = (process, "q1"))
            q2 = threading.Thread(target = blocked, args = (process, "q2"))
            q3 = threading.Thread(target = blocked, args = (process, "q3"))

            # change state
            process["ioStatus"] = IOStatus.WAITING.name
            with messanger:
                print("process {} waiting for I/O".format(process["pid"]))
            # Send message to the frontend with new update
            send_processes()

            # start threads and wait for them to complete
            queues = []
            if process["q1"] == 1:
                queues.append(q1)
                process["q1"] = 0
                q1.start()

            if process["q2"] == 1:
                queues.append(q2)
                process["q2"] = 0
                q2.start()
            
            if process["q3"] == 1: 
                queues.append(q3) 
                process["q3"] = 0 
                q3.start()            

            for queue in queues:
                queue.join()

            # change IO status to NONE since all threads are complete at this point
            process["ioStatus"] = IOStatus.NONE.name

            # check if process wasn't suspended while it was blocked
            if process["state"] == State.BLOCKED.name:
                # change state and add to ready queue
                process["state"] = State.READY.name
                ready.put(process)
                with messanger:
                    print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
            else:
                # process was blocked/suspended and must wait to enter main memory
                process["state"] = State.READY_SUS.name
            with messanger:
                print("process {} I/O complete".format(process["pid"]))
            # Send message to the frontend with new update
            send_processes()
        
        #READY/SUSPEND
        if process["state"] == State.READY_SUS.name:
            while process["state"] == State.READY_SUS.name:
                # process constantly checks if available memory is greater than or equal to its size
                if available_memory[0] >= process["size"]:
                    # checks if it is the largest ready/suspend process given the available memory
                    largest_process = find_largest_ready_sus_process()
                    if largest_process["pid"] == process["pid"]:
                        with messanger:
                            print("process {} brought back into main memory".format(process["pid"]))
                        with mem:
                            # decrease memory by process size
                            mod_mem(available_memory[0] - process["size"])
                        # change state and add to ready queue
                        process["state"] = State.READY.name
                        ready.put(process)
                        with messanger:
                            print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                        
                        # send message to frontend
                        send_processes()
                        break
                
                with lock:
                    if num_blocked() > 0:
                            sus = suspend_a_blocked_process(process)
                            # decrease available memory
                            if sus:
                                largest_process = find_largest_ready_sus_process()
                                with messanger:
                                    print("largest process {} vs current process {}".format(largest_process["pid"], process["pid"]))
                                if largest_process["pid"] == process["pid"]:
                                    with messanger:
                                        print("process {} into main memory".format(process["pid"]))
                                    with mem:
                                        # decrease memory by process size
                                        mod_mem(available_memory[0] - process["size"])
                                    # change state and add to ready queue
                                    process["state"] = State.READY.name
                                    ready.put(process)
                                    with messanger:
                                        print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                                    
                                    # send message to frontend
                                    send_processes()
                                    break


def num_blocked():
    track = 0
    for i in processes:
        if i["state"] == State.BLOCKED.name:
            track += 1
    return track

def num_ready_sus():
    track = 0
    for i in processes:
        if i["state"] == State.READY_SUS.name:
            track += 1
    return track


# puts back process taken from ready queue since Queue object has no peek function
def putBack(process):
    global ready
    new_ready = Queue(maxsize = len(processes)) 
    new_ready.put(process)
    while not ready.empty():
        next = ready.get()
        new_ready.put(next)
    ready = new_ready
    
# Finds the largest ready/suspend process to bring back into memory
def find_largest_ready_sus_process():
    largest_process = None
    max_size = 0

    for process in processes:
        if process["state"] == State.READY_SUS.name and process["size"] <= available_memory[0]:
            if process["size"] > max_size:  # Compare current process size to max_size
                max_size = process["size"]
                largest_process = process
    
    return largest_process

def suspend_a_blocked_process(process):
    # searches for blocked processes in main memory first
    largest_process = find_largest_blocked_process()
    if largest_process is not None:
        if available_memory[0] + largest_process["size"] < process["size"]:
            return False
        with messanger:
            print(f"Suspending process {largest_process['pid']} to free memory.")
        largest_process["state"] = State.BLOCK_SUS.name
        with mem:
            mod_mem(available_memory[0] + largest_process["size"])
        send_processes()
        
        return True
    return False
                
# Suspends a process in main memory to bring in a new process
def suspend_a_process(process):
    # searches for blocked processes in main memory first
    largest_process = find_largest_blocked_process()

    if largest_process is not None:
        if available_memory[0] - largest_process["size"] <= process["size"]:
            return False
        if largest_process:
            with messanger:
                print(f"Suspending process {largest_process['pid']} to free memory.")
            largest_process["state"] = State.BLOCK_SUS.name
            with mem:
                mod_mem(available_memory[0] - largest_process["size"])
            send_processes()
        
        return True
    else:
        # if there are currently no blocked processes in main memory, then a ready process is suspended
        largest_process = find_largest_ready_process()

        if largest_process is None or available_memory[0] - largest_process["size"] <= process["size"]:
            return False

        if largest_process:
            with messanger:
                print(f"Suspending process {largest_process['pid']} to free memory.")
            largest_process["state"] = State.READY_SUS.name
            with mem:
                mod_mem(available_memory[0] + largest_process["size"])
            send_processes()
        
        return True

# Finds the largest blocked process in main memory 
def find_largest_blocked_process():
    largest_process = None

    for process in processes:
        if process["state"] == State.BLOCKED.name:
            if largest_process is None or process["size"] > largest_process["size"]:
                largest_process = process
    
    return largest_process

# Finds the largest ready process in main memory
def find_largest_ready_process():
    largest_process = None

    for process in processes:
        if process["state"] == State.READY.name:
            if largest_process is None or process["size"] > largest_process["size"]:
                largest_process = process
    
    return largest_process

# Sends all processes (pid, iostatus, state) to the frontend
def send_processes():
    with messanger:
        print("-----------------------------------------------")
        new_list = [
            {
                "pid": process["pid"],
                "ioStatus": process["ioStatus"],
                "state": process["state"],
                "q1":process["q1"],
                "q2":process["q2"],
                "q3":process["q3"]
            }
            for process in processes
        ]
        socketio.emit("processes", new_list)

# Queue threads - wait for 5,10, or 15 seconds for IO (random selection)
def blocked(process, q):
    duration_options = [5,10,15]
    random_int = random.randint(0,len(duration_options)-1)

    ioLength = duration_options[random_int]
    with messanger:
        print("process {} is waiting for io on queue #{} at time: {}".format(process["pid"],q,time.ctime()[11:19]))
    time.sleep(ioLength)

    with messanger:
        print("process {} io completed on queue #{} at time: {}".format(process["pid"],q,time.ctime()[11:19]))

# Processor
def running(process):

    with messanger:
        print("process {} is running at: {}".format(process["pid"], time.ctime()[11:19]))
    
    # process "runs" unil timeout
    if process["duration"] > time_slice:
        time.sleep(time_slice)
        process["duration"] -= time_slice

    else:
        # if process time is less than time slice, it runs until completion
        time.sleep(process["duration"])
        process["duration"] = 0

    

    # process finishes running
    if process["duration"] == 0:
        # change state
        process["state"] = State.EXIT.name
        with mem:
            # increase available memory
            mod_mem(available_memory[0] + process["size"])
        # sends message to frontend
        send_processes()
    else:
        with messanger:
            print("process {} timeout at: {}".format(process["pid"], time.ctime()[11:19]))
        
        # if there is no io, then process reenters ready queue
        if process["io"] <= 0:
            process["state"] = State.READY.name
            
            with messanger:
                print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))

            ready.put(process)
            send_processes()
            
        else:
            # if process has io, then state and IO status is changed
            process["state"] = State.BLOCKED.name
            process["status"] = IOStatus.WAITING.name

            # opening queues for each io event
            if process["io"] == 1:
                process["q1"] = 1
                process["io"] -= 1
                send_processes()

            elif process["io"] == 2:
                process["q1"] = 1
                process["q2"] = 1
                process["io"] -= 2
                send_processes()

            else:
                process["q1"] = 1
                process["q2"] = 1
                process["q3"] = 1
                process["io"] -= 3
                send_processes()

# adds processes to process list to be processed
def mod_processes(process):
    processes.append(process)

############################################################################################

# Flask app setup
app = Flask(__name__)
app.config['SECRET_KEY'] = "secret"
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app,cors_allowed_origins="http://localhost:5173",async_mode="threading")

# test endpoint
@app.route('/http-call')
def http_call():
    data = {'data':'This text was fetched using an HTTP Call to server on render'}
    return jsonify(data)

# endpoint that loads processes to processes list and sets up memory size and time slice 
@app.route('/load', methods=['POST'])
def load():
    global memory_size
    global time_slice

    data = request.json

    # retrieves processes, memorysize, and time slice
    processes_input = data.get('processes')
    mem_input = data.get('memorySize')
    time_input = data.get('timeSlice')

    memory_size = mem_input
    time_slice = time_input

    print(processes_input)
    
    global processes 
    processes = []
    for i in processes_input:
        # assigns a random process length from 15-20 seconds
        # default state is NEW
        # adds 3 queues per process
        i["duration"] = random.randint(15,20)
        i["ioStatus"] = i["ioStatus"].upper()
        i["state"] = "NEW"
        i["q1"] = 0
        i["q2"] = 0
        i["q3"] = 0
        print("Process {}".format(i))
        mod_processes(i) 

    print(processes)

    return jsonify({"message": "Task started"}), 200

# Socket enpoint that confirms client connection
@socketio.on('connect')
def connect():
    print(request.sid)
    print("Client is connected")
    emit("test", {
        "data":f"{request.sid} is connected"
    })

# starts simulation 
@socketio.on('start')
def start():
    print("Memory size: {}".format(memory_size))
    print("Time slice: {}".format(time_slice))
    print(processes)

    # starts threads for all processes
    global threads_proc
    threads_proc = []
    for i in processes:
        t = threading.Thread(target = manager, args = (i,))
        threads_proc.append(t)
        t.start()

    for queue in threads_proc:
        queue.join()
    
    # returns okay when processes end
    return jsonify({"OK": True}), 200

# Stops simulation
@socketio.on('stop')
def stop():
    global threads_proc
    threads_proc = []
    for i in threads_proc:
        i._stop_event.set()
    

    
# Socket enpoint that confirms client disconnection
@socketio.on('disconnect')
def disconnected():
    print("User disconnected")
    print(request.sid)
    try:
        emit("disconnect", f"user {request.sid} has been disconnected", broadcast=True)
    except Exception as e:
        print(f"Error during disconnect: {e}")

if __name__ == "__main__":
    # runs flask backend on port 5001
    socketio.run(app,debug=True,port=5001)