@echo off
echo ========================================
echo NoteKeeper Database Setup for Windows
echo ========================================
echo.

echo Checking if MySQL is installed...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL 8.0+ and add it to your PATH
    echo Download from: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

echo MySQL found. Checking if MySQL service is running...
net start | findstr /i "mysql" >nul
if %errorlevel% neq 0 (
    echo Starting MySQL service...
    net start mysql
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start MySQL service
        echo Please start MySQL manually and try again
        pause
        exit /b 1
    )
)

echo.
echo Setting up database...
echo.

echo Creating database and user...
echo Please enter your MySQL root password when prompted:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS notekeeper; CREATE USER IF NOT EXISTS 'notekeeper'@'localhost' IDENTIFIED BY 'password'; GRANT ALL PRIVILEGES ON notekeeper.* TO 'notekeeper'@'localhost'; FLUSH PRIVILEGES;"

if %errorlevel% neq 0 (
    echo ERROR: Failed to create database or user
    echo Please check your MySQL root password and try again
    pause
    exit /b 1
)

echo.
echo Initializing database schema...
mysql -u notekeeper -ppassword notekeeper < database\init.sql

if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize database schema
    echo Please check the database/init.sql file exists
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database setup completed successfully!
echo ========================================
echo.
echo You can now start the application:
echo 1. Start backend: cd backend && mvn spring-boot:run
echo 2. Start frontend: cd frontend && npm start
echo.
echo Demo account: demo@notekeeper.com / password
echo.
pause
