import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="mx-auto max-w-7xl flex gap-4">
      <div className="w-full flex flex-col gap-4">
        <div className=" h-72"></div>
        <Button onClick={fetchData}>Test HTTP</Button>
        <Button className=" self-end" onClick={()=>socket.connect()}>Run</Button>       
        {/* <div className="line">
            {!loading && <WebSocketCall socket={socketInstance} />}
        </div> */}
        <Card>
          <CardContent>
            <div>
              <Button>
                Add Basic Process
              </Button>
              <Button>
                Add Process with I/O
              </Button>
              <Button>
                Add Custom Process
              </Button>
            </div>
            <div>
              <span>
                <label htmlFor="
                ">Time Slice</label>
              <input/>
              </span>
              <span></span>
              </div>

            <Button>Add Process</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="grow-1">
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
        </CardHeader>
        <CardContent>hi</CardContent>
        <HttpCall/>
      </Card>
    </main>
  );
}

export default App;
