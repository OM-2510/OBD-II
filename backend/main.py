from flask import Flask, render_template
from threading import Thread
from time import sleep
from flask_socketio import SocketIO
import obd

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

running = False
connection = None

def obd_reader():
    global running, connection
    connection = obd.OBD("/dev/pts/5")

    if connection.status() == obd.OBDStatus.CAR_CONNECTED:
        print("Successful Connection")

        while running:
            try:
                def get_val(param):
                    if(not param.is_null()):
                        return param.value.magnitude
                    else:
                        return 0

                rpm = connection.query(obd.commands.RPM)
                speed = connection.query(obd.commands.SPEED)

                data = {
                    "RPM" : get_val(rpm),
                    "SPEED" : get_val(speed)
                }

                socketio.emit('obd_data', data)

                sleep(1)

            except Exception as e:
                print("Error retrieving data!")
                running = False
                    
    
    else:
        print("OBD Connection Failed")
        running = False


@socketio.on('connect')
def handle_connect():
    global running, connection
    print("WebSocket Communication hot")

    if not running:
        running = True
        obd_thread = Thread(target = obd_reader)
        obd_thread.start()

@socketio.on('disconnect')
def handle_disconnect():
    print("Websocket Connection down")
    running = False


if __name__ == '__main__':
    connection = obd.OBD() 
    socketio.run(app, host='localhost', port=3000)