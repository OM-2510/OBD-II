import './MID.css';
import CoolantTemp from "./CoolantTemp";
import WarningIcons from './WarningIcons';

function MID({ coolant = 50, iat = 15, timingAdvance = 8, stft = 20, ltft = 18, map = 101, vbatt = 14.1, engineLoad = 20 }) {
   const formatTrim = (val) => {
        if (val === 0) return { text: "0 %", color: "text-green-400" };
        if (val > 0) return { text: `+${val} %`, color: "text-red-400" };
        return { text: `-${Math.abs(val)} %`, color: "text-blue-400" };
    };

    const stftDisplay = formatTrim(stft);
    const ltftDisplay = formatTrim(ltft);

    return (
        <div className='mid-wrapper flex flex-col w-100 ml-20 text-xl'>
            <WarningIcons/>
            <CoolantTemp temp={coolant} />

            <div className="flex flex-col text-gray-300 w-full">
                
                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-500">Battery Volt</span>
                    <span className={`text-right ${vbatt < 12.0 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                        {vbatt.toFixed(1)} V
                    </span>
                </div>

                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-500">Manifold Press</span>
                    <span className="text-right">
                        {map} kPa
                    </span>
                </div>

                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-500">Intake Air Temp</span>
                    <span className="text-right">
                        {iat} <span className="font-mono relative -top-1.5 text-base">°</span>C
                    </span>
                </div>
                
                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-500">Timing Advance</span>
                    <span className="text-right">
                        {timingAdvance}<span className="font-mono relative -top-1.5 text-base">°</span> BTDC
                    </span>
                </div>
                
                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-500">STFT</span>
                    <span className={`text-right ${stftDisplay.color}`}>
                        {stftDisplay.text}
                    </span>
                </div>
                
                <div className="flex justify-between items-center w-full">
                    <span className="text-gray-500">LTFT</span>
                    <span className={`text-right ${ltftDisplay.color}`}>
                        {ltftDisplay.text}
                    </span>
                </div>

                {/* --- LINEAR ENGINE LOAD GAUGE (Themed to match SideArches) --- */}
                <div className="mt-8 w-full flex flex-col items-center">
                    {/* The Gauge Container */}
                    <div className="relative w-full h-5 border-b-[2px] border-[#444]">
                        
                        {/* The Active Blue Progress Line */}
                        <div 
                            className="absolute bottom-0 left-0 h-[8px] bg-[#0088ff] transition-all duration-200 z-0"
                            style={{ 
                                width: `${Math.min(Math.max(engineLoad, 0), 100)}%`,
                                filter: 'drop-shadow(0 0 4px rgba(0, 136, 255, 0.4))' 
                            }}
                        ></div>
                        
                        {/* The 4 Tick Marks (z-10 to cut through the blue line) */}
                        <div className="absolute bottom-0 left-0 w-full flex justify-between h-5 z-10">
                            <div className="w-[2px] h-full bg-[#aaa]"></div>
                            <div className="w-[2px] h-full bg-[#aaa]"></div>
                            <div className="w-[2px] h-full bg-[#aaa]"></div>
                            <div className="w-[2px] h-full bg-[#aaa]"></div>
                        </div>

                    </div>
                    
                    {/* The Label matching the "E" and "MAX" typography */}
                    <div className="flex justify-between w-full mt-2 text-[#888] text-sm font-bold">
                        <span>0</span>
                        <span className="tracking-widest uppercase">Eng Load</span>
                        <span>MAX</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default MID;