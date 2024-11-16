import { Button } from "@/components/ui/button";
import { Container, Stage, Text } from "@pixi/react";
import { Circle } from "@/components/Circle";
import { TextStyle } from "pixi.js";
import SettingsPanel from "@/components/SettingsPanel";
import TaskManager from "@/components/TaskManager";
import { Toaster } from "@/components/ui/toaster";
import { ProcessContextProvider } from "@/contexts/ProcessContext";
import { useState, useEffect} from "react";
import { socket } from "@/services/socket.ts";

function App() {
  const [isRunning, setIsRunning] = useState(false)


  useEffect(() => {
      socket.on('connect',() => {
        console.log("Connected to server")
      });

      socket.on("processes",(data)=>{
        console.log(data)
      })

      socket.on("test",(data)=>{
        console.log(data)
      })

      return () => {
        socket.off('connect');
        socket.off("processes")
      }; 
  },[])

  async function startSimulation(){
    socket.connect();
    socket.emit("start");
    setIsRunning(true)
  }

  async function stopSimulation(){
    setIsRunning(false)
  }

  
  return (
    <>
      <main className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-2xl font-bold uppercase text-center">
          7 State Process Model Simulation
        </h1>
        <ProcessContextProvider>
          <div className="flex gap-4">
            <div className="w-full flex flex-col gap-4">
              <Stage>
                <Container>
                  <Text
                    text="Hello World!"
                    x={150}
                    y={150}
                    style={
                      new TextStyle({
                        fill: "white",
                        fontSize: 36,
                        fontFamily: "Arial",
                      })
                    }
                  />
                  <Circle />
                </Container>
              </Stage>
              {isRunning ? (
                <Button className=" self-end" onClick={stopSimulation}> Stop </Button>
              ):(
                <Button className=" self-end" onClick={startSimulation}>Run</Button>
              )}
              
              <SettingsPanel />
            </div>
            <TaskManager />
          </div>
        </ProcessContextProvider>
      </main>
      <Toaster />
    </>
  );
}

export default App;
