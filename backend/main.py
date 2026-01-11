import eventlet
eventlet.monkey_patch() # Allows for concurrency around python GIL

from flask import Flask
from flask_socketio import SocketIO
import obd

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=60) # keeping sufficient ping so that the server stays live and does'nt suffer buggy and jittery UI

running = False
connection = None

def obd_reader():
    global running, connection
    print("Trying to connect with Vehicle ... ")
    
    try:
        if connection is None or not connection.is_connected():
            connection = obd.OBD("COM4", fast=False, timeout=15) # waits 15 seconds before throwing up the error
        
        if connection.is_connected():
            print("Successful connection with vehicle ✅")
            while running:
                r = connection.query(obd.commands.RPM)
                s = connection.query(obd.commands.SPEED)
                c = connection.query(obd.commands.COOLANT_TEMP)
                l = connection.query(obd.commands.ENGINE_LOAD)
                
                payload = {
                    "RPM": r.value.magnitude if not r.is_null() else 0,
                    "SPEED": s.value.magnitude if not s.is_null() else 0,
                    "COOLANT_TEMP" : max(50, c.value.magnitude) if not c.is_null() else 50,
                    "ENGINE_LOAD" : l.value.magnitude if not l.is_null() else 0
                }
                
                socketio.emit('obd_data', payload)
                # print(f"Sent: {payload}")
                eventlet.sleep(0.05) # Using event.let because time.sleep causes issues with python GIL
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
    print("Server Live: http://localhost:5000")
    socketio.run(app, host='localhost', port=5000)