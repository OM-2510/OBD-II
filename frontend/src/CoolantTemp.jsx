export default function CoolantTemp({ COOLANT_TEMP }) {
    
    function getColor(temp) {
        if (temp < 70) {
            return "text-green-500";
        } else if (temp >= 70 && temp < 100) {
            return "text-yellow-500";
        } else {
            return "text-red-500";
        }
    }

    return(
        <div className={"flex items-center justify-between text-white"}>
            <p className='lg:text-xl text-2xl'>Coolant Temp:</p>            
            <p className={`lg:text-xl text-2xl ${getColor(COOLANT_TEMP)}`}> {COOLANT_TEMP}°C</p>
        </div>
    );
}