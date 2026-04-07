import React from 'react';

const getColor = (temp) => {
    if (temp == null) return "text-gray-500";
    
    if (temp < 50) {
        return "text-blue-500";       
    } else if (temp < 85) {
        return "text-yellow-500";     
    } else if (temp < 110) {
        return "text-green-500";      
    } else {
        return "text-red-500 animate-pulse font-bold"; 
    }
};

export default function CoolantTemp({ temp = 50 }) {
    return (
        <div className="flex items-center justify-between text-white w-full">
            <span className="text-gray-500 tracking-wide">
                Coolant Temp
            </span>            
            <span className={`text-right ${getColor(temp)}`}>
                {temp}
                <span className="font-mono relative -top-1.5 text-base">°</span>
                C
            </span>
        </div>
    );
}