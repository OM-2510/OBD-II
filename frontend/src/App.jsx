import { useOBDData } from "./useOBDData";
import LfaDash from "./LfaDash";
import MID from "./MID";


export default function App() {
  const data = useOBDData();  

  return (
    <div className="bg-black h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans">

      <div className="pl-12 flex flex-row items-center justify-center scale-[0.55] sm:scale-75 lg:scale-100 xl:scale-150">

        <div className="relative z-10 shrink-0">
          <LfaDash
            rpm={data.RPM}
            speed={data.SPEED}
            temp={data.COOLANT_TEMP}
            throttle={data.THROTTLE_POS}
            fuel={data.FUEL_LEVEL}
            inst_fe={data.INSTANT_FE}
            avg_fe={data.AVG_FE}
            trip_dist={data.TRIP_DIST}
          />
        </div>

        <div className="relative z-0 pl-12 text-white">
          <MID
            coolant={data.COOLANT_TEMP}
            iat={data.INTAKE_TEMP}
            timingAdvance={data.TIMING_ADV}
            stft={data.STFT}
            ltft={data.LTFT}
            engineLoad={data.ENGINE_LOAD}
          />
        </div>

      </div>
    </div>
  );
}