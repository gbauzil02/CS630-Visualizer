# CS630-Visualizer

__Install requirements.txt__
pip install -r /path/to/requirements.txt

__Setup Environment__
This project consists of a Python backend using the Flask framework In order to use this framework with the front end, you must use a virtual environment.

First install the virtual environment package using: **pip install virtualenv**

To create virtual environment: **virtualenv venv**

To activate virtual environment:

__Windows__: **venv\Scripts\activate**

__Linux/MacOS__: **source venv/bin/activate**


Set the Flask app environment variable to index.py:

__Windows__: **set FLASK_APP=main.py**

__Linux/MacOS__: **export FLASK_APP=main.py**


__Endpoint Testing using Insonmnia:__
Download and login to Insomnia: https://insomnia.rest/download

Once logged in and at home page click import, navigate to repository, click on **Insomnia_YYYY-MM-DD.json**, click scan, and import. To run run HTTP requests, select **Send** button and response should be visible on the right side.

For POST requests, click **Body** tab and add properly formatted json to be sent to endpoint. 

For properly formatted json model please see "api/*Controller.py" for specific function and proper models should appear at the top of the python page. For proper URL, please see **@api.route()** for extension to local host:port or check configured endpoint docs on Swagger


__View Endpoints Using Swagger__
http://127.0.0.1:5000/docs