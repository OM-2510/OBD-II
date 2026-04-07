import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import LfaDash from "./LfaDash";
import MID from "./MID";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default function App() {
  const [data, setData] = useState({
    RPM:           6000,
    SPEED:         220,
    COOLANT_TEMP:  90,
    INTAKE_TEMP:   23,
    THROTTLE_POS:  80,
    MAF:           3.5,
    TIMING_ADV:    18,
    ENGINE_LOAD:   12,
    STFT:          1.2,
    LTFT:          3.4,
    FUEL_LEVEL:    60,
    
    INSTANT_FE:    15,
    AVG_FE:        19,
    TRIP_DIST:     167,
  });

  useEffect(() => {
    socket.on('obd_data', (incoming) => {
      setData(incoming);
    });
    return () => socket.off('obd_data');
  }, []);

  return (
    <div className="bg-black h-screen w-full flex items-center justify-center overflow-hidden font-sans">
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