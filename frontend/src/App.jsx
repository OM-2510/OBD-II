import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactSpeedometer from "react-d3-speedometer";
import PowerandTorqueGauge from "./PowerandTorque";
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
    // let CURR_TORQUE = 80;
    // let CURR_HP = 50;

    return(
        <div className="min-h-screen flex-col justify-between pt-10">
            
            <div className="flex justify-between px-5">
                <ReactSpeedometer
                    value = {data.COOLANT_TEMP}
                    minValue = {50}
                    maxValue = {120}
                    needleColor="#FF4500"
                    segmentColors={["#39FF14", "#39FF14", "#39FF14","#39FF14", "#FF4500" ]}
                    textColor="#39FF14"
                    ringWidth={10}
                    currentValueText="°C"
                    width={250}
                    paddingHorizontal={10}
                    paddingVertical={10}
                />

                <div className="flex justify-around">
                    <PowerandTorqueGauge 
                        PEAK_HP = {PEAK_HP}
                        PEAK_TORQUE = {PEAK_TORQUE}
                        CURR_HP = {CURR_HP}
                        CURR_TORQUE = {CURR_TORQUE}
                    />
                </div>

                <ReactSpeedometer
                    value = {data.COOLANT_TEMP}
                    minValue = {50}
                    maxValue = {120}
                    needleColor="#FF4500"
                    segmentColors={["#39FF14", "#39FF14", "#39FF14","#39FF14", "#FF4500" ]}
                    textColor="#39FF14"
                    ringWidth={10}
                    currentValueText="°C"
                    width={250}
                    paddingHorizontal={10}
                    paddingVertical={10}
                />
                
            </div>


            
            <div className="-my-25 flex justify-between">
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
                    paddingHorizontal={50}
                    paddingVertical={15}
                    width={500}
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
                    paddingHorizontal={50}
                    paddingVertical={15}
                    width = {500}
                />

            </div>
        </div>
    )
}