import React from 'react'
import { useEffect, useState } from "react";

function HttpCall() {
    const[data,setData] = useState("")

    useEffect(() => {
        fetch("http://localhost:5001/http-call", {
            headers:{
                "Content-type":"application/json"
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })

        .then((responseData) => {
            setData(responseData.data); // assuming response contains 'data' field
        })
        .catch((error) => {
            console.error("There was a problem with the fetch operation:", error);
            setData("Error fetching data");
        });
        // .then((response) => response.json())
        // .then((responseData) => {
        //     setData(responseData.data)
        // })
        
    }, []);

    return (
        <h3>
            {data}
        </h3>
    )
}

export default HttpCall