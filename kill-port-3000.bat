@echo off
echo Finding and killing process on port 3000...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a
)

echo.
echo Done! Port 3000 should now be free.
echo You can now run: npm run dev
echo.
pause
