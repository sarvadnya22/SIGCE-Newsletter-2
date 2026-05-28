@echo off
:: Create a Desktop shortcut to start.bat
set SCRIPT="%~dp0start.bat"
set SHORTCUT="%USERPROFILE%\Desktop\SIGCE Newsletter.lnk"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut(%SHORTCUT%); $s.TargetPath = %SCRIPT%; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = 'shell32.dll,21'; $s.Description = 'Start SIGCE Newsletter App'; $s.Save()"

echo.
echo  Shortcut created on Desktop: "SIGCE Newsletter"
echo  Double-click it anytime to launch the app!
echo.
pause
