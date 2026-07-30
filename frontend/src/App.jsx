import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactSpeedometer from "react-d3-speedometer";
import ClutchSlipWarning from "./ClutchSlipWarning";
import CoolantTemp from "./CoolantTemp";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default function App(){
    const [data, setData] = useState({
        "RPM": 0,
        "SPEED": 0,
        "COOLANT_TEMP" : 0,
        "INTAKE_TEMP" : 0,
        "THROTTLE_POS" : 0,
        "FUEL_LEVEL" : 0,
        "MAF"  : 0,
        "TIMING_ADV" : 0,
        "ENGINE_LOAD" : 0,
        "STFT" : 0,
        "LTFT" : 0
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
        <div className="bg-black overflow-hidden justify-evenly items-center h-screen flex-col lg:px-10">

            <div className="lg:mt-70 lg:scale-100 lg:mx-0 -mx-16 -my-5 scale-85 flex justify-between items-center">
                <div className="lg:scale-170 lg:ml-25">
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
                        paddingVertical={30}
                        paddingHorizontal={30}
                    />
                </div>
                
                <div className="scale-70 lg:scale-100 flex-col pt-7 px-9 text-red-700 lg:w-120 lg:h-120 py-2 justify-center space-y-2.5 border-gray-700 border rounded-lg w-80 h-100">
                    <CoolantTemp
                        COOLANT_TEMP = {data.COOLANT_TEMP}
                    />
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>INTAKE TEMP: </p>            
                        <p className='lg:text-xl text-base'>{data.INTAKE_TEMP}°C</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>THROTTLE POS: </p>            
                        <p className='lg:text-xl text-base'>{data.THROTTLE_POS}</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>FUEL LEVEL: </p>            
                        <p className='lg:text-xl text-base'>{data.FUEL_LEVEL}</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>MAF: </p>            
                        <p className='lg:text-xl text-base'>{data.MAF}</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>TIMING ADV: </p>            
                        <p className='lg:text-xl text-base'>{data.TIMING_ADV}°</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>ENGINE LOAD: </p>            
                        <p className='lg:text-xl text-base'>{data.ENGINE_LOAD}</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>STFT: </p>            
                        <p className='lg:text-xl text-base'>{data.STFT}</p>
                    </div>
                    <div className={"flex items-center justify-between gap-2 text-white"}>
                        <p className='lg:text-xl text-base whitespace-nowrap'>LTFT: </p>            
                        <p className='lg:text-xl text-base'>{data.LTFT}</p>
                    </div>
                </div>

                <div className="lg:scale-170 lg:mr-25">
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
                        paddingHorizontal={30}
                        paddingVertical={30}
                    />

                </div>

            </div>

        </div>
    )
}