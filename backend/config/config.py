from decouple import config
import os
import pyodbc

BASE_DIR=os.path.dirname(os.path.realpath(__file__))

class Config:
    SECRET_KEY=config('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS=config('SQLALCHEMY_TRACK_MODIFICATIONS', cast=bool)


#If running on windows, check the backslash on '/DigiCertGlobalRootCA.crt.pem' and make it '\DigiCertGlobalRootCA.crt.pem'
class DevConfig(Config):
    username = 'gkl'
    password = 'Alpha__9'
    server = 'cs630-visualizer.database.windows.net'
    database = 'cs630-visualizer'
    
    SQLALCHEMY_DATABASE_URI = (
        f"mssql+pyodbc://{username}:{password}@{server}/{database}"
        f"?driver=ODBC+Driver+18+for+SQL+Server"
    )
    
    DEBUG=True

    SQLALCHEMY_ECHO=True

class ProdConfig(Config):
    pass

class TestConfig(Config):
    pass