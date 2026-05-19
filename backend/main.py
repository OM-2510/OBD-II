import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO
import obd

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=60) 

running = False
connection = None


def obd_reader():
    global running, connection
    print("Trying to connect with Vehicle ... ")
    
    try:
        if connection is None or not connection.is_connected():
            connection = obd.OBD("COM4", fast=False, timeout=15)
        
        if connection.is_connected():
            print("Successful connection with vehicle ✅")

            while running:
                rpm = connection.query(obd.commands.RPM)
                speed = connection.query(obd.commands.SPEED)
                coolant_temp = connection.query(obd.commands.COOLANT_TEMP)
                intake_air_temp = connection.query(obd.commands.INTAKE_TEMP) 
                throttle_pos = connection.query(obd.commands.THROTTLE_POS)
                fuel_level = connection.query(obd.commands.FUEL_LEVEL)
                maf = connection.query(obd.commands.MAF)    
                timing = connection.query(obd.commands.TIMING_ADVANCE)
                eninge_load = connection.query(obd.commands.ENGINE_LOAD)
                stft = connection.query(obd.commands.SHORT_FUEL_TRIM_1)
                ltft = connection.query(obd.commands.LONG_FUEL_TRIM_1)

                

                payload = {
                    "RPM": rpm.value.magnitude if not rpm.is_null() else 0,
                    "SPEED": speed.value.magnitude if not speed.is_null() else 0,
                    "COOLANT_TEMP" : coolant_temp.value.magnitude if not coolant_temp.is_null() else None,
                    "INTAKE_TEMP" : intake_air_temp.value.magnitude if not intake_air_temp.is_null() else None,
                    "THROTTLE_POS" : throttle_pos.value.magnitude if not throttle_pos.is_null() else 0,
                    "FUEL_LEVEL" : fuel_level.value.magnitude if not fuel_level.is_null() else None,
                    "MAF"  : maf.value.magnitude*100 if not maf.is_null() else 0,
                    "TIMING_ADV" : timing.value.magnitude if not timing.is_null() else None,
                    "ENGINE_LOAD" : eninge_load.value.magnitude if not eninge_load.is_null() else 0,
                    "STFT" : stft.value.magnitude if not stft.is_null() else None,
                    "LTFT" : ltft.value.magnitude if not ltft.is_null() else None,


                }
                
                socketio.emit('obd_data', payload)
                eventlet.sleep(0.05) 
        else:
            print("Failed conneciton with vehicle ❌")
            running = False
            
    except Exception as e:
        print(f"Connection error: {e}")
        running = False

@socketio.on('connect')
def handle_connect():
    global running
    print("Browser Chained 🔗")
    if not running:
        running = True
        socketio.start_background_task(obd_reader)

@socketio.on('disconnect')
def handle_disconnect():
    print("Browser Unlinked ⛓️‍💥")
    print("Searching for Signal ... ")
    socketio.start_background_task(shutdown)

def shutdown():
    eventlet.sleep(15)
    if len(socketio.server.eio.sockets) == 0:
        global running
        running = False
        print("Server Down 🚩 ...")



if __name__ == '__main__':
    print("Server Live: http://127.0.0.1:5000")
    socketio.run(app, host='127.0.0.1', port=5000)