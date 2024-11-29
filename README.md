# CS630-Visualizer

# Description

This project is a visualization of the 7 state process model. The project consists of a web app that lets you create a number of processes and configure general parameters for the simulation itself. The visualization will then run and showcase the processes moving from one state to another, going all the way from NEW ro EXIT.

In order to use this project, you must have Node.js installed on your machine. You can download Node.js from the following link: https://nodejs.org/en/download/
You can check if you have Node.js installed by running the following command in your terminal: `node -v`

You also need to have Python installed on your machine. You can download Python from the following link: https://www.python.org/downloads/
You can check if you have Python installed by running the following command in your terminal:

```bash
python --version
python3 --version # for linux
```

## Setup

```bash
npm install
```

```bash
npm run build
```

```bash
npm start
```

**Install requirements.txt**

```bash
cd backend
pip install -r backend/requirements.txt
```

**Setup Environment**
This project consists of a Python backend using the Flask framework In order to use this framework with the front end, you must use a virtual environment.

To create virtual environment: `python3 -m venv venv`

To activate virtual environment:

**Windows**: **venv\Scripts\activate**

**Linux/MacOS**: `source venv/bin/activate`
