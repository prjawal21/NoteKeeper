@echo off
echo ========================================
echo NoteKeeper Database Force Reset
echo WARNING: This will delete all data in the database!
echo ========================================
echo.

:: Check if MySQL is running
net start | findstr /i "mysql" >nul
if %errorlevel% neq 0 (
    echo Starting MySQL service...
    net start mysql >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start MySQL service
        pause
        exit /b 1
    )
)

echo Dropping existing database...
mysql -u root -e "DROP DATABASE IF EXISTS notekeeper;"

echo Creating new database...
mysql -u root -e "CREATE DATABASE notekeeper;"

:: Import the updated schema and data
echo Importing data...
mysql -u root notekeeper < "%~dp0database\init.sql"

echo.
echo ========================================
echo Database reset complete!
echo.
echo Login with:
echo Email: demo@notekeeper.com
echo Password: password
echo.
echo ========================================
pause
