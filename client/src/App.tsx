import { Button } from "@/components/ui/button";
import { Container, Stage, Text } from "@pixi/react";
import { Circle } from "@/components/Circle";
import { TextStyle } from "pixi.js";
import SettingsPanel from "@/components/SettingsPanel";
import TaskManager from "@/components/TaskManager";
import { Toaster } from "@/components/ui/toaster";
import { ProcessContextProvider } from "@/contexts/ProcessContext";
import { io, Socket } from 'socket.io-client';
import { useState, useEffect} from "react";
import HttpCall from "./components/HttpCall";

function App() {
  const [socketInstance,setSocketInstance] = useState<Socket | null>(null);
  const [loading,setLoading] = useState(true)
  const [buttonStatus,setButtonStatus] = useState(false)

  const socket = io("http://localhost:5001", {
    autoConnect: false
  });

  const handleClick = () => {
    if (buttonStatus === false){
      setButtonStatus(true)
    }else{
      setButtonStatus(false)
    }
  }

  async function fetchData(){
    const request = await fetch("http://localhost:5001/http-call");
    const data = await request.json();
    console.log(data);
  }

  useEffect(() => {
      socket.on('connect',() => {
        console.log("Connected to server")
      });

      socket.on("test",(data)=>{
        console.log(data)
      })

      return () => {
        socket.off('connect');
      }; 
  },[])

  
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
              <Button className=" self-end">Run</Button>
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
