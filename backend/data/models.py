from .exts import db
from uuid import uuid1
import datetime
from sqlalchemy import CheckConstraint, Enum as SQLAEnum
from enum import Enum

class State(Enum):
    RUNNING = "running"
    READY = "ready"
    NEW = "new"
    BLOCKED = "blocked"
    BLOCK_SUS = "blocked/suspend"
    READY_SUS = "ready/suspend"
    EXIT = "exit"

class Processes(db.Model):
    __tablename__="processes"
    pid=db.Column(db.Integer(),primary_key=True, autoincrement=True)        # Process ID: autoincrement
    io=db.Column(db.Integer(),nullable=False, default=0)                    # Has IO: 0 = false, 1 = true
    ioLength=db.Column(db.Integer(),nullable=False, default=10)             # Time spent waiting for I/O = 10 seconds
    duration=db.Column(db.Integer(),nullable=False, default=20)             # Process duration = 20 seconds
    size=db.Column(db.Integer(),nullable=False, default=25)                 # Default size:  = 1 MB
    queues=db.Column(db.Integer(),nullable=False, default=0)                # Number of event queues opened: default = 0
    state=db.Column(SQLAEnum(State), nullable=False, default=State.NEW)  # Process State default: NEW
    lastmodified=db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)


    # Check that the process has no more than 3 event queues
    __table_args__ = (
        CheckConstraint('queues <= 3', name='check_queues_max_value'),
    )
    

    def __repr__(self):
        return f"<Process(self.pid) >"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self,pid,io,ioLength,duration,size,queues):
        self.pid=pid
        self.io=io
        self.ioLength=ioLength 
        self.duration=duration
        self.size=size
        self.queues=queues 

        db.session.commit()