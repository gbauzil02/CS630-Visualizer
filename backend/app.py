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
time_slice = 5 #5 seconds

# memory should be multiples of 8
memory_size = 64 # 64 GB
available_memory = [memory_size]


# only 1 thread allowed to access the "processor" at a time
processor = Semaphore(1)

# only 1 thread allowed to send a message at one time
messanger = Semaphore(1)

mem = Semaphore(1)

lock = threading.Lock()

class State(Enum):
    NEW = 1
    READY = 2
    RUNNING = 3
    EXIT = 4
    BLOCKED = 5
    BLOCK_SUS = 6
    READY_SUS = 7

class IOStatus(Enum):
    WAITING = 1
    NONE = 2

processes = []

ready = Queue(maxsize = len(processes))

def mod_mem(num):
    available_memory.append(num)
    available_memory.pop(0)

def manager(process):
    print("inside manager")
     # pass by reference versus pass by value 
    while process["state"] != State.EXIT.name:
        # NEW
        if process["state"] == State.NEW.name:
                while process["state"] == State.NEW.name:
                    if available_memory[0] >= process["size"]:
                        with mem:
                            mod_mem(available_memory[0] - process["size"])
                        process["state"] = State.READY.name
                        ready.put(process)
                        with messanger:
                            print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                            print("process {} changed to ready. available memory: {}".format(process["pid"],available_memory))
                
                    else:  
                        if suspend_a_blocked_process(process):
                            process["state"] = State.READY.name
                            ready.put(process)
                            with mem:
                                mod_mem(available_memory[0] - process["size"])
                            with messanger:
                                print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                                print("process {} changed to ready".format(process["pid"]))
                                print("available memory: {}".format(available_memory))
                        else:
                            if available_memory[0] == memory_size:
                                process["state"] = State.EXIT.name
                                break
                            continue
                            # process["state"] = State.READY_SUS.name
                            # with messanger:
                            #     print("process {} changed to ready/suspend".format(process["pid"]))
                            #     print("available memory: {}".format(available_memory))
                    send_processes()

        # READY => RUNNING
        if process["state"] == State.READY.name:
            run = False
            while process["state"] == State.READY.name:
                with lock:
                    try:
                        nextp = ready.get()
                        while nextp["state"] != State.READY.name:
                            nextp = ready.get()
                    except Empty:
                        print("Queue is empty, no processes to run.")
                        continue
                    if nextp["pid"] == process["pid"]:
                        run = True
                    else:
                        putBack(nextp)
                        # print("nextp process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))


                if run:
                    if process["duration"] == 0:
                        process["state"] = State.EXIT.name
                        with mem:
                            mod_mem(available_memory[0] + process["size"])

                        with messanger:
                            print("process {} exiting".format(process["pid"]))
                        send_processes()
                        return True
                    with lock:
                        process["state"] = State.RUNNING.name
                        send_processes()
                        processor.acquire()
                        running(process)
                        processor.release()
                    ready.task_done()
                    with messanger:
                        print("process {} back from running. Ready queue: {}".format(process["pid"], list(ready.queue)))
                    break
                else:
                    continue
            
        
        # BLOCKED AND BLOCKED/SUSPEND
        if process["state"] == State.BLOCKED.name:
            q1 = threading.Thread(target = blocked, args = (process, "q1"))
            q2 = threading.Thread(target = blocked, args = (process, "q2"))
            q3 = threading.Thread(target = blocked, args = (process, "q3"))

            process["ioStatus"] = IOStatus.WAITING.name
            with messanger:
                print("process {} waiting for I/O".format(process["pid"]))
            send_processes()

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

            process["ioStatus"] = IOStatus.NONE.name

            if process["state"] == State.BLOCKED.name:
                process["state"] = State.READY.name
                ready.put(process)
                with messanger:
                    print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
            else:
                process["state"] = State.READY_SUS.name
            with messanger:
                print("process {} I/O complete".format(process["pid"]))
            send_processes()
        
        #READY/SUSPEND
        if process["state"] == State.READY_SUS.name:
            while process["state"] == State.READY_SUS.name:
                if available_memory[0] >= process["size"]:
                    largest_process = find_largest_ready_sus_process()
                    if largest_process["pid"] == process["pid"]:
                        with messanger:
                            print("process {} brought back into main memory".format(process["pid"]))
                        with mem:
                            mod_mem(available_memory[0] - process["size"])
                        process["state"] = State.READY.name
                        ready.put(process)
                        with messanger:
                            print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))
                        send_processes()
                        break

def num_ready_sus():
    track = 0
    for i in processes:
        if i["state"] == State.READY_SUS.name:
            track += 1
    return track

def find_best_blocked_sus_process():
    best_process = None
    space_left = None

    for process in processes:
        if process["state"] == State.READY_SUS.name:
            if process["size"] <= available_memory[0]:
                diff = available_memory[0] - process["size"]
                
                if space_left is None or space_left < space_left:
                    space_left = diff 
                    best_process = process
    return best_process

def putBack(process):
    global ready
    new_ready = Queue(maxsize = len(processes)) 
    new_ready.put(process)
    while not ready.empty():
        next = ready.get()
        new_ready.put(next)
    ready = new_ready
    

def find_largest_ready_sus_process():
    largest_process = None

    for process in processes:
        if process["state"] == State.READY_SUS.name:
            if (largest_process is None or process["size"] > largest_process["size"]) and process["size"] <= available_memory[0]:
                largest_process = process
    
    return largest_process
                

def suspend_a_blocked_process(process):
    largest_process = find_largest_blocked_process()


    if largest_process is not None:
        if available_memory[0] - largest_process["size"] < process["size"]:
            return False
        if largest_process:
            with messanger:
                print(f"Suspending process {largest_process['pid']} to free memory.")
            largest_process["state"] = State.BLOCK_SUS.name
            send_processes()
            with mem:
                mod_mem(available_memory[0] + largest_process["size"])
            time.sleep(2)
        
        return True
    else:
        largest_process = find_largest_ready_process()

        if largest_process is None or available_memory[0] - largest_process["size"] < process["size"]:
            return False

        if largest_process:
            with messanger:
                print(f"Suspending process {largest_process['pid']} to free memory.")
            largest_process["state"] = State.READY_SUS.name
            send_processes()
            with mem:
                mod_mem(available_memory[0] + largest_process["size"])
            
            time.sleep(2)
        
        return True


def find_largest_blocked_process():
    largest_process = None

    for process in processes:
        if process["state"] == State.BLOCKED.name:
            if largest_process is None or process["size"] > largest_process["size"]:
                largest_process = process
    
    return largest_process

def find_largest_ready_process():
    largest_process = None

    for process in processes:
        if process["state"] == State.READY.name:
            if largest_process is None or process["size"] > largest_process["size"]:
                largest_process = process
    
    return largest_process

def send_processes():
    with messanger:
        print("-----------------------------------------------")
        new_list = [{"pid": process["pid"], "ioStatus": process["ioStatus"], "state": process["state"]} for process in processes]
        socketio.emit("processes", new_list)

def blocked(process, q):
    duration_options = [5,10,15]
    random_int = random.randint(0,len(duration_options)-1)

    ioLength = duration_options[random_int]
    with messanger:
        print("process {} is waiting for io on queue #{} at time: {}".format(process["pid"],q,time.ctime()[11:19]))
    time.sleep(ioLength)

    with messanger:
        print("process {} io completed on queue #{} at time: {}".format(process["pid"],q,time.ctime()[11:19]))


def running(process):

    with messanger:
        print("process {} is running at: {}".format(process["pid"], time.ctime()[11:19]))
    if process["duration"] > time_slice:
        time.sleep(time_slice)
        process["duration"] -= time_slice

    else:
        time.sleep(process["duration"])
        process["duration"] = 0

    


    if process["duration"] == 0:
        process["state"] = State.EXIT.name
        with mem:
            mod_mem(available_memory[0] + process["size"])
        send_processes()
    else:
        with messanger:
            print("process {} timeout at: {}".format(process["pid"], time.ctime()[11:19]))
        
        if process["io"] == 0:
            process["state"] = State.READY.name
            
            with messanger:
                print("process {} added to ready queue: {}".format(process["pid"], list(ready.queue)))

            ready.put(process)
            
        else:
            process["state"] = State.BLOCKED.name
            process["status"] = IOStatus.WAITING.name
            if process["io"] == 1:
                process["q1"] = 1
                process["io"] -= 1

            elif process["io"] == 2:
                process["q1"] = 1
                process["q2"] = 1
                process["io"] -= 2

            else:
                process["q1"] = 1
                process["q2"] = 1
                process["q3"] = 1
                process["io"] -= 3
        send_processes()

def mod_processes(process):
    processes.append(process)


app = Flask(__name__)
app.config['SECRET_KEY'] = "secret"
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app,cors_allowed_origins="http://localhost:5173")

@app.route('/http-call')
def http_call():
    data = {'data':'This text was fetched using an HTTP Call to server on render'}
    # emit("data", f"This text was fetched using an HTTP Call to server on render")
    return jsonify(data)



@app.route('/load', methods=['POST'])
def load():
    global memory_size
    global time_slice

    data = request.json
    processes_input = data.get('processes')
    mem_input = data.get('memorySize')
    time_input = data.get('timeSlice')

    memory_size = mem_input
    time_slice = time_input

    print(processes_input)
    
    
    # def run_task(process):
    #     manager(process)
    
    # threads_proc = []
    global processes 
    processes = []
    for i in processes_input:
        i["duration"] = random.randint(15,20)
        i["ioStatus"] = i["ioStatus"].upper()
        i["state"] = "NEW"
        i["q1"] = 0
        i["q2"] = 0
        i["q3"] = 0
        print("Process {}".format(i))
        mod_processes(i) 

        # t = threading.Thread(target = run_task, args = (i,))
        # threads_proc.append(t)
        # t.start()
    print(processes)

    return jsonify({"message": "Task started"}), 200

@socketio.on('connect')
def connect():
    print(request.sid)
    print("Client is connected")
    emit("test", {
        "data":f"{request.sid} is connected"
    })

@socketio.on('start')
def start():
    print("Memory size: {}".format(memory_size))
    print("Time slice: {}".format(time_slice))
    print(processes)

    threads_proc = []
    for i in processes:
        t = threading.Thread(target = manager, args = (i,))
        threads_proc.append(t)
        t.start()

    for queue in threads_proc:
        queue.join()
    return jsonify({"OK": True}), 200

    

@socketio.on('disconnect')
def disconnected():
    print("User disconnected")
    print(request.sid)
    try:
        emit("disconnect", f"user {request.sid} has been disconnected", broadcast=True)
    except Exception as e:
        print(f"Error during disconnect: {e}")

@socketio.on('data')
def handle_message(data):
    print("Data from the frontend", str(data))
    emit("data", {
        'data':data,'id':request.sid
    },broadcast=True)

if __name__ == "__main__":
    socketio.run(app,debug=True,port=5001)