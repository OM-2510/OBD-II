import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactSpeedometer from "react-d3-speedometer";
import PowerandTorqueGauge from "./PowerandTorque";
import ClutchSlipWarning from "./ClutchSlipWarning";
import CoolantTemp from "./CoolantTemp";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default function App(){
    const [data, setData] = useState({
        SPEED : 0,
        RPM : 0,
        COOLANT_TEMP : 50,
        ENGINE_LOAD : 0
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

    let PEAK_TORQUE = 112;
    let PEAK_HP = 82;
    let CURR_TORQUE = data.ENGINE_LOAD==0?0:PEAK_TORQUE*data.ENGINE_LOAD/100;
    let CURR_HP = CURR_TORQUE*data.RPM/7127;

    return(
        <div className="bg-black overflow-hidden justify-evenly items-center h-screen flex-col lg:px-10">
            
            <div className="lg:scale-100 lg:mt-0 -mt-8 scale-50 flex justify-center gap-45 items-center">
                    <PowerandTorqueGauge 
                        PEAK_HP = {PEAK_HP}
                        PEAK_TORQUE = {PEAK_TORQUE}
                        CURR_HP = {CURR_HP}
                        CURR_TORQUE = {CURR_TORQUE}
                    />

            </div>
            
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
                
                <div className="scale-80 lg:scale-100 flex-col px-9 text-red-700 lg:w-120 lg:h-120 py-2 justify-center border-gray-700 border rounded-lg w-80 h-100">
                    {/* <ClutchSlipWarning/> */} 
                    <CoolantTemp
                        COOLANT_TEMP = {data.COOLANT_TEMP}
                    />
                    

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