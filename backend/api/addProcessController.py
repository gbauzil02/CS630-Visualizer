from main import api
from flask_restx import Resource, fields
from flask import request
from service.addProcessService import addProcess


new_process_model=api.model(
    'NewProcess',
    {
        "io":fields.Integer(),
        "ioLength":fields.Integer(),
        "duration":fields.Integer(),
        "size":fields.Integer()
    }
)

@api.route('/addProcess')
class AddProcessResource(Resource):
    @api.expect(new_process_model)
    def post(self):
        """Add a new process"""
        io=request.json["io"]
        ioLength=request.json["ioLength"]
        duration=request.json["duration"]
        size=request.json["size"]
        return addProcess(io, ioLength, duration, size)