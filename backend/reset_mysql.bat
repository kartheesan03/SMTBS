@echo off
echo ===================================================
echo   SMTBMS LOCAL MYSQL PASSWORD RESET UTILITY (V3)
echo ===================================================
echo.
echo This script will reset your local MySQL 'root' password to 'root'.
echo.
echo IMPORTANT: You MUST run this script as Administrator.
echo Checking for Administrator privileges...
echo.

net session >nul 2>&1
if %errorLevel% == 0 (
    echo [SUCCESS] Running with Administrator privileges!
) else (
    echo [ERROR] This script MUST be run as Administrator!
    echo Please right-click this file and select "Run as Administrator".
    echo.
    pause
    exit /b 1
)

echo.
echo 1. Stopping MySQL80 Service and clearing database file locks...
net stop MySQL80 >nul 2>&1
taskkill /f /im mysqld.exe >nul 2>&1

echo.
echo Waiting for all MySQL instances to release locks...
:wait_stop
sc query MySQL80 | find "STOPPED" >nul
if errorlevel 1 (
    timeout /t 1 /nobreak >nul
    goto wait_stop
)
echo All database file locks cleared successfully!

echo.
echo 2. Creating temporary initialization script...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; > "%~dp0mysql-init.txt"
echo Created init script at: "%~dp0mysql-init.txt"

echo.
echo 3. Resetting password (starting temporary server)...
start "" /b "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%~dp0mysql-init.txt" --console
echo Server starting... Waiting 10 seconds for init-file to execute...
timeout /t 10 /nobreak >nul

echo Stopping temporary server...
taskkill /f /im mysqld.exe >nul 2>&1

echo.
echo 4. Cleaning up temporary files...
del "%~dp0mysql-init.txt"

echo.
echo 5. Restarting standard MySQL80 service...
net start MySQL80

echo.
echo ===================================================
echo   PASSWORD RESET COMPLETED SUCCESSFULLY!
echo ===================================================
echo.
echo Your local MySQL 'root' password is now set to: root
echo.
pause
