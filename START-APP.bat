@echo off
echo ========================================
echo   Starting Accounting Management App
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start cmd /k "cd /d d:\accounting-management\backend && npm start"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start cmd /k "cd /d d:\accounting-management\frontend && npm start"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
