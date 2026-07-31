from gevent import monkey
monkey.patch_all()

from flask import Flask
from flask_socketio import SocketIO
import gevent
import obd
import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timezone

app = Flask(__name__)
socketio = SocketIO(app, async_mode="gevent", cors_allowed_origins="*", ping_timeout=60)

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

### Mongo DB Connection
client = MongoClient(os.getenv("MONGODB_URI"))

try:
    client.admin.command("ping")
    print("Connected successfully")

except Exception as e:
    raise Exception("Database Connection Error", e) 

db = client["obd_dashboard"]
readings_col = db["readings"]
trips_col = db["trips"]

running = False
connection = None
current_trip_file = None
current_trip_start = None

LOG_DIR = "trip_logs"
os.makedirs(LOG_DIR, exist_ok=True)


def obd_reader():
    global running, connection, current_trip_file, current_trip_start, consecutive_failures
    print("Trying to connect with Vehicle ...")

    try:
        if connection is None or not connection.is_connected():
            #Virtual Port for testing that is utilizing ELM-327 Emulator
            connection = obd.OBD("/dev/pts/4", fast=False, timeout=15)

            # Laptop's Communication Port for OBD-II Adapter 
            # connection = obd.OBD("COM4", fast=False, timeout=15)

        if connection.is_connected():
            print("Vehicle Connected✅")

            current_trip_start = datetime.now(timezone.utc)
            trip_filename = f"trip_{current_trip_start.strftime('%Y%m%d_%H%M%S')}.jsonl"
            current_trip_file = os.path.join(LOG_DIR, trip_filename)

            with open(current_trip_file, "w") as f:

                while running:
                    if not connection.is_connected():
                        print("Vehicle Disconnected❌")
                        running = False
                        break

                    rpm = connection.query(obd.commands.RPM)
                    speed = connection.query(obd.commands.SPEED)
                    coolant_temp = connection.query(obd.commands.COOLANT_TEMP)
                    intake_air_temp = connection.query(obd.commands.INTAKE_TEMP)
                    throttle_pos = connection.query(obd.commands.THROTTLE_POS)
                    fuel_level = connection.query(obd.commands.FUEL_LEVEL)
                    maf = connection.query(obd.commands.MAF)
                    timing = connection.query(obd.commands.TIMING_ADVANCE)
                    engine_load = connection.query(obd.commands.ENGINE_LOAD)
                    stft = connection.query(obd.commands.SHORT_FUEL_TRIM_1)
                    ltft = connection.query(obd.commands.LONG_FUEL_TRIM_1)

                    payload = {
                        "RPM": rpm.value.magnitude if not rpm.is_null() else 0,
                        "SPEED": speed.value.magnitude if not speed.is_null() else 0,
                        "COOLANT_TEMP": coolant_temp.value.magnitude if not coolant_temp.is_null() else None,
                        "INTAKE_TEMP": intake_air_temp.value.magnitude if not intake_air_temp.is_null() else None,
                        "THROTTLE_POS": throttle_pos.value.magnitude if not throttle_pos.is_null() else 0,
                        "FUEL_LEVEL": fuel_level.value.magnitude if not fuel_level.is_null() else None,
                        "MAF": maf.value.magnitude * 100 if not maf.is_null() else 0,
                        "TIMING_ADV": timing.value.magnitude if not timing.is_null() else None,
                        "ENGINE_LOAD": engine_load.value.magnitude if not engine_load.is_null() else 0,
                        "STFT": stft.value.magnitude if not stft.is_null() else None,
                        "LTFT": ltft.value.magnitude if not ltft.is_null() else None,
                    }

                    socketio.emit('obd_data', payload)

                    log_entry = dict(payload)
                    log_entry["timestamp"] = datetime.now(timezone.utc).isoformat()
                    f.write(json.dumps(log_entry) + "\n")

                    gevent.sleep(0.05)

            process_and_store_trip(current_trip_file, current_trip_start)
            os._exit(0)

        else:
            print("Vehicle Connection Failed❌")
            running = False

    except Exception as e:
        print(f"Vehicle Connection error: {e}")
        running = False


def process_and_store_trip(filepath, start_time):
    # Create log file with instances of vehicle state during the trip
    if not os.path.exists(filepath):
        print("No trip file found!")
        return

    readings = []
    with open(filepath, "r") as f:
        for line in f:
            line = line.strip()
            if line:
                readings.append(json.loads(line))

    if not readings:
        print("Trip file was empty!")
        os.remove(filepath)
        return

    end_time = datetime.now(timezone.utc)
    stats = compute_stats(readings)

    trip_doc = {
        "start_time": start_time,
        "end_time": end_time,
        "duration_seconds": (end_time - start_time).total_seconds(),
        "reading_count": len(readings),
        "stats": stats,
    }
    trip_id = trips_col.insert_one(trip_doc).inserted_id

    for r in readings:
        r["trip_id"] = trip_id
    readings_col.insert_many(readings)

    print(f"Trip {trip_id} stored: {stats}")

    os.remove(filepath)
    print(f"Deleted local log file: {filepath}")


def compute_stats(readings):
    #Run calculations for a complete trip stats
    speeds = [r["SPEED"] for r in readings if r.get("SPEED") is not None]
    rpms = [r["RPM"] for r in readings if r.get("RPM") is not None]
    loads = [r["ENGINE_LOAD"] for r in readings if r.get("ENGINE_LOAD") is not None]
    throttles = [r["THROTTLE_POS"] for r in readings if r.get("THROTTLE_POS") is not None]
    coolant_temps = [r["COOLANT_TEMP"] for r in readings if r.get("COOLANT_TEMP") is not None]

    def safe_avg(lst):
        return round(sum(lst) / len(lst), 2) if lst else None

    def safe_max(lst):
        return max(lst) if lst else None

    idle_count = sum(1 for r in readings if r.get("RPM", 0) > 0 and r.get("SPEED", 0) == 0)
    idle_pct = round((idle_count / len(readings)) * 100, 2) if readings else 0

    hard_events = 0
    for i in range(1, len(readings)):
        prev_speed = readings[i-1].get("SPEED")
        curr_speed = readings[i].get("SPEED")
        if prev_speed is not None and curr_speed is not None:
            if abs(curr_speed - prev_speed) > 5:  
                hard_events += 1

    return {
        "avg_speed": safe_avg(speeds),
        "max_speed": safe_max(speeds),
        "avg_rpm": safe_avg(rpms),
        "max_rpm": safe_max(rpms),
        "avg_engine_load": safe_avg(loads),
        "avg_throttle": safe_avg(throttles),
        "max_coolant_temp": safe_max(coolant_temps),
        "idle_time_pct": idle_pct,
        "hard_event_count": hard_events,
    }


### Websocket Events
@socketio.on('connect')
def handle_connect():
    global running
    print("WebSockets Hot🔌")
    if not running:
        running = True
        socketio.start_background_task(obd_reader)

@socketio.on('disconnect')
def handle_disconnect():
    print("Websockets Down 🛑")
    print("Retrying... ")
    socketio.start_background_task(shutdown)

def shutdown():
    global running
    gevent.sleep(15)
    if len(socketio.server.eio.sockets) == 0:
        running = False
        print("Idle Payload at Halt 💤")


if __name__ == '__main__':
    print("Server Live: http://127.0.0.1:5000")
    socketio.run(app, host='127.0.0.1', port=5000)