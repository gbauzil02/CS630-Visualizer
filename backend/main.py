from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from data.exts import db
# from data.models import Clients, GeneralInfo, WorkoutGoal, CoachExp, Location, State, ClientCoaches
from data.models import Processes
from config.config import DevConfig

app=Flask(__name__)
CORS(app)
app.config.from_object(DevConfig)
db.init_app(app)
api=Api(app,doc='/docs')

@app.shell_context_processor
def make_shell_context():
    return{
        "db":db,
        "Processes": Processes
    }

with app.app_context():
    db.create_all()
    
import api