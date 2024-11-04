from data.exts import db
from sqlalchemy.sql import text

def getProcesses():
        query = text(
                "select * "
                "from processes"
        )
        processes=db.session.execute(query).fetchall()
        return processes