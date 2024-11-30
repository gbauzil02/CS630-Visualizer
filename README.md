# CS630-Visualizer

## Description

This project is a visualization of the 7 state process model. The project consists of a web app that lets you create a number of processes and configure general parameters for the simulation itself. The visualization will then run and showcase the processes moving from one state to another, going all the way from NEW ro EXIT.

## Setup

In order to use this project, you must have Node.js installed on your machine. You can download Node.js from the following link: https://nodejs.org/en/download/
You can check if you have Node.js installed by running the following command in your terminal:

```bash
node -v
```

To install Node on Mac, please visit https://brew.sh/ to install Homebrew. To add homebrew to your path and install node run the commands:

```bash
export PATH=$PATH:/opt/homebrew/bin
brew install npm
```

You also need to have Python installed on your machine. You can download Python from the following link: https://www.python.org/downloads/
You can check if you have Python installed by running the following command in your terminal:

```bash
python --version
python3 --version # for Mac/linux
```

### Windows Automation

if you are using Windows, you can run the `setup.bat` file to install the required packages and start the servers. To do this, open the terminal and run the following command:

```bash
setup.bat
```

### Client

- Enter the client directory:

```bash
cd client
```

- Install the required packages:

```bash
npm install
```

- Build the project:

```bash
npm run build
```

- Start the frontend server:

```bash
npm run preview
```

The frontend server should now be running on `http://localhost:4173/`

The server will be running in the terminal window so you will need to open a new terminal window to run the backend.

### Backend

Enter the backend directory:

```bash
cd backend
```

This project consists of a Python backend using the Flask framework In order to use this framework with the front end, you must use a virtual environment. **NOTE**: This step is not mandatory for Mac/Linux users.

- To create virtual environment:

```bash
python3 -m venv venv
```

To activate virtual environment:

**Windows**:

```bash
venv\Scripts\activate
```

**Linux/MacOS**:

```bash
source venv/bin/activate
```

- Install the required packages:

```bash
pip install -r requirements.txt
```

- Start the backend server:

```bash
python3 app.py
```
