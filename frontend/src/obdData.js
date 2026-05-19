import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const DEFAULT_DATA = {
  RPM:          6000,
  SPEED:        220,
  COOLANT_TEMP: 90,
  INTAKE_TEMP:  23,
  THROTTLE_POS: 80,
  MAF:          3.5,
  TIMING_ADV:   18,
  ENGINE_LOAD:  12,
  STFT:         1.2,
  LTFT:         3.4,
  FUEL_LEVEL:   60,
  INSTANT_FE:   15,
  AVG_FE:       19,
  TRIP_DIST:    167,
};


export function useOBDData(url = "http://127.0.0.1:5000") {
  const [data, setData]     = useState(DEFAULT_DATA);
  const pendingRef          = useRef(null);   // latest unprocessed packet
  const rafIdRef            = useRef(null);   // RAF handle
  const isConnected         = useRef(false);

 
  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (pendingRef.current !== null) {
        setData(pendingRef.current);
        pendingRef.current = null;
      }
    });
  }, []);

  useEffect(() => {
    const socket = io(url, { transports: ["websocket"] });

    socket.on("connect",    () => { isConnected.current = true;  });
    socket.on("disconnect", () => { isConnected.current = false; });

    socket.on("obd_data", (incoming) => {
      pendingRef.current = incoming;
      scheduleFlush();
    });

    return () => {
      socket.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [url, scheduleFlush]);

  return data;
}