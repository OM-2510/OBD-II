import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { RadialGauge } from 'react-canvas-gauges';
import { LinearGauge } from 'react-canvas-gauges';

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default function App(){
    const [data, setData] = useState({
        SPEED : 0,
        RPM : 0,
    });

    useEffect(()=>{
        console.log("Fetching data from backend from the frontend");
        socket.on('obd_data', (data)=>{
            setData(data);
        })

        return()=>{
            socket.off('obd_data');
        }
    }, []);

    return(
        <>
            
        </>
    )
}