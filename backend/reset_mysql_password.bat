@echo off
echo =======================================================
echo MySQL Root Password Reset Script
echo =======================================================
echo.
echo NOTE: You MUST run this script as Administrator.
echo If you didn't right-click and "Run as Administrator", close this and do so.
echo.
pause

echo.
echo [1/5] Stopping MySQL80 service...
net stop MySQL80

echo.
echo [2/5] Creating password reset command file...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; > C:\mysql-init.txt

echo.
echo [3/5] Starting MySQL temporarily to apply new password...
start "MySQL Password Reset" /b "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --init-file=C:\mysql-init.txt --console

echo.
echo [4/5] Waiting for 10 seconds to allow MySQL to start and process the file...
timeout /t 10 /nobreak

echo.
echo [5/5] Terminating temporary MySQL process...
taskkill /F /IM mysqld.exe

echo.
echo Cleaning up...
del C:\mysql-init.txt

echo.
echo Starting MySQL80 service normally...
net start MySQL80

echo.
echo =======================================================
echo DONE! 
echo Your local MySQL root password has been reset to: root
echo You can now go back to VS Code and run 'npm run dev'.
echo =======================================================
pause
