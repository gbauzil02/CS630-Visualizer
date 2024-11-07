import React from 'react'
import { useEffect, useState } from "react";

function WebSocketCall(socket) {
    const [message,setMessage] = useState("")
    const [messages,setMessages] = useState()

    const handleText = (e) => {
        const inputMessage = e.target.value
        setMessage(inputMessage)
    }

    const handleSubmit = () => {
        if(!message){
            return;
        }

        socket.emit('data',message)
        setMessage("")
    }

    useEffect(() => {
        socket.on('data',(data) => {
            setMessages([...messages,data.data])
        })

        return () => {
            socket.off('data',() => {
                console.log("data event was removed")
            })
        }
    },[socket,messages])




    return (
        <div>
            <h2>Websocket Communication</h2>
            <input type="text" onChange={handleText} value={message}/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
        
    )
}

export default WebSocketCall