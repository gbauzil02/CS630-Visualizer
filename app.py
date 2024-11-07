from flask import Flask,request,jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = "secret"
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app,cors_allowed_origins="http://localhost:5173")

@app.route('/http-call')
def http_call():
    data = {'data':'This text was fetched using an HTTP Call to server on render'}
    # emit("data", f"This text was fetched using an HTTP Call to server on render")
    return jsonify(data)

@socketio.on('connect')
def connect():
    print(request.sid)
    print("Client is connected")
    emit("test", {
        "data":f"{request.sid} is connected"
    })
    

@socketio.on('disconnect')
def disconnected():
    print("User disconnected")
    print(request.sid)
    try:
        emit("disconnect", f"user {request.sid} has been disconnected", broadcast=True)
    except Exception as e:
        print(f"Error during disconnect: {e}")

@socketio.on('data')
def handle_message(data):
    print("Data from the frontend", str(data))
    emit("data", {
        'data':data,'id':request.sid
    },broadcast=True)

if __name__ == "__main__":
    socketio.run(app,debug=True,port=5001)