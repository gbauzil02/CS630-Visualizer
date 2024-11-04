from data.models import Processes
from flask import jsonify

def addProcess(io, ioLength, duration, size):
    new_process=Processes(
        io=io,
        ioLength=ioLength,
        duration=duration,
        size=size
    )
    new_process.save()
    return jsonify({"message": "Process created successfuly"})