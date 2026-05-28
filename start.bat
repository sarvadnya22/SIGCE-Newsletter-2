@echo off
setlocal enabledelayedexpansion
title SIGCE Newsletter - Launcher Pro
color 0B

echo.
echo  ==========================================
echo    SIGCE Newsletter - Launcher Pro v2.0
echo  ==========================================
echo.

:: Kill everything stuck on port 5000 or 5174
echo  [1/4] Clearing old processes on ports 5000 and 5174...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 "') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5174 "') do taskkill /F /PID %%a >nul 2>&1

:: Small pause
ping -n 2 127.0.0.1 >nul

:: Start Backend
echo  [2/4] Starting Backend server (port 5000)...
cd /d "%~dp0backend"
start "SIGCE Backend" cmd /k "node server.js"

:: Wait for backend to boot (using ping for delay)
ping -n 4 127.0.0.1 >nul

:: Start Frontend
echo  [3/4] Starting Frontend dev server (port 5174)...
cd /d "%~dp0frontend"
start "SIGCE Frontend" cmd /k "npm.cmd run dev"

:: Smart Wait for Frontend Port to be Ready
echo  [4/4] Waiting for frontend to be accessible...
set "attempts=0"

:WaitLoop
netstat -ano | findstr ":5174" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo  Frontend is READY!
    goto :DoneWait
)
<nul set /p=.
ping -n 2 127.0.0.1 >nul
set /a attempts+=1
if %attempts% lss 20 goto :WaitLoop

:DoneWait

echo.
echo  Opening browser at http://127.0.0.1:5174 ...
start "" "http://127.0.0.1:5174"

echo.
echo  ==========================================
echo    App is running!
echo    Frontend : http://127.0.0.1:5174
echo    Backend  : http://localhost:5000
echo  ==========================================
echo.
echo  Keep the two server windows open. 
echo  Press any key to close this launcher.
pause >nul
