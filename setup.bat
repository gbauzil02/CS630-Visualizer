@echo off
setlocal

REM Set up Python backend
:setup_backend
echo Setting up Python API...
cd backend

REM Check if virtual environment exists, and create it if not
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

REM Activate the virtual environment and install Python dependencies
call venv\Scripts\activate
pip install -r requirements.txt
echo Python packages installed.

REM Run Python API in a new Command Prompt window
start cmd /k "cd /d %cd% && call venv\Scripts\activate && python app.py"
echo Python API is running in a new window.

REM Deactivate virtual environment and return to the original directory
deactivate
cd ..

REM Set up React Frontend
:setup_client
echo Setting up React Frontend...
cd client

REM Install Node.js dependencies
npm install
echo React dependencies installed.

REM Build the React frontend
npm run build
echo React frontend built.

REM Run React frontend in a new Command Prompt window
start cmd /k "cd /d %cd% && npm run preview"

REM Wait a moment for the server to start
timeout 3 > nul

REM Open the browser automatically to the hardcoded web address
start "" "http://localhost:4173"
echo React frontend is being served at http://localhost:4173.

cd ..

echo Setup complete.Python API and React frontend are running.
pause
