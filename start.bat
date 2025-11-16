@echo off
echo.
echo ===================================
echo  Dutch Planning Regulations App
echo ===================================
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run setup.bat first
    echo.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not installed!
    echo Please run setup.bat first
    echo.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: No .env file found. Creating from template...
    copy .env.example .env
    echo.
    echo Please edit .env and add your DSO API key, then run this script again.
    pause
    exit /b 1
)

echo Starting application...
echo.
echo Backend will start on http://localhost:3000
echo Frontend will start on http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run dev
