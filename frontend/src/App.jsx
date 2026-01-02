import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactSpeedometer from "react-d3-speedometer";

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
        <div className="bg-black h-screen flex justify-center items-center gap-20">
            <ReactSpeedometer
                value = {data.SPEED}
                minValue = {0}
                maxValue = {200}
                segments= {20}
                maxSegmentLabels={10}
                needleColor = "#FF4500"
                segmentColors= {["#39FF14"]}
                needleTransition="easeLinear"
                ringWidth={10}
                textColor="#39FF14"
                currentValueText = {'km/h'}
                labelFontSize="18px"
                paddingHorizontal={15}
                paddingVertical={20}
            />

            <ReactSpeedometer
                value = {data.RPM/1000}
                minValue = {0}
                maxValue = {8}
                segments= {8}
                maxSegmentLabels={8}
                needleColor = "#FF4500"
                segmentColors= {["#39FF14", "#39FF14", "#39FF14", "#39FF14", "#39FF14", "#39FF14", "#FF4500", "#FF4500"]}
                needleTransition="easeLinear"
                ringWidth={10}
                textColor="#39FF14"
                currentValueText = {'x1000 RPM'}
                labelFontSize="18px"
                paddingHorizontal={15}
                paddingVertical={20}
            />
        </div>
    )
}