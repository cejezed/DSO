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
    echo .env file created!
    echo.
    echo ===================================
    echo  BELANGRIJK: API KEY CONFIGURATIE
    echo ===================================
    echo.
    echo De .env file is aangemaakt, maar bevat nog GEEN echte API key!
    echo.
    echo OPTIE 1: Test zonder API key
    echo   - PDOK geocoding werkt volledig
    echo   - DSO endpoints geven mogelijk errors
    echo   - Gewoon starten met: npm run dev
    echo.
    echo OPTIE 2: Configureer DSO API key
    echo   - Open: .env file in een text editor
    echo   - Vervang: your_dso_api_key_here
    echo   - Met je echte DSO API key
    echo.
    echo Nog geen API key? Zie: HOW_TO_GET_API_KEY.md
    echo Of ga naar: https://aandeslagmetdeomgevingswet.nl/
    echo.
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
echo 1. (Optioneel) Edit .env and add DSO API key
echo    Zie HOW_TO_GET_API_KEY.md voor instructies
echo.
echo 2. Run 'npm run dev' to start
echo.
echo 3. Open http://localhost:5173 in browser
echo.
echo 4. Test de APIs met: node test-apis.js
echo.
pause
