from main import api, app
from flask_restx import Resource, fields
from service.getProcesses import getProcesses
from data.models import State
from enum import Enum

def state_enum_to_string(state_enum):
    return state_enum.value if isinstance(state_enum, Enum) else str(state_enum)


process_model=api.model(
    "Processes",
    {
        "pid":fields.Integer(),
        "io":fields.Integer(),
        "ioLength":fields.Integer(),
        "duration":fields.Integer(),
        "size":fields.Integer(),
        "queues":fields.Integer(),
        "state":fields.String(attribute=lambda x: state_enum_to_string(x.state)),
        "lastmodified":fields.DateTime()
    }

)

@api.route('/processes')
class ProcessesResource(Resource):
    @api.marshal_list_with(process_model)
    def get(self):
        """Get all Processes"""
        clients = getProcesses()
        return clients