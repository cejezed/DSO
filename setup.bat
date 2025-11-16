@echo off
echo.
echo ===================================
echo  Dutch Planning Regulations Setup
echo ===================================
echo.

echo [1/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Creating .env file from template...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please edit it and add your DSO API key.
) else (
    echo .env file already exists. Skipping...
)

echo.
echo [4/4] Setup complete!
echo.
echo ===================================
echo  Next steps:
echo ===================================
echo.
echo 1. Edit .env file and add your DSO API key (optional for testing)
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:5173 in your browser
echo.
pause
