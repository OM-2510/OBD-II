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
        <div className={"flex items-center justify-between gap-2 text-white"}>
            <p className='lg:text-xl text-base whitespace-nowrap'>COOLANT TEMP:</p>            
            <p className={`lg:text-xl text-base ${getColor(COOLANT_TEMP)}`}>{COOLANT_TEMP}°C</p>
        </div>
    );
}