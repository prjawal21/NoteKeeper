@echo off
echo ========================================
echo NoteKeeper Database Connection Test
echo ========================================
echo.

echo Testing MySQL connection...
mysql -u notekeeper -ppassword -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL with notekeeper user
    echo.
    echo Possible solutions:
    echo 1. Make sure MySQL is running
    echo 2. Run setup-database.bat to create the user
    echo 3. Check if the password is correct
    echo.
    pause
    exit /b 1
)

echo MySQL connection successful!
echo.

echo Testing database access...
mysql -u notekeeper -ppassword -e "USE notekeeper; SHOW TABLES;" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Cannot access notekeeper database
    echo.
    echo Possible solutions:
    echo 1. Run setup-database.bat to create the database
    echo 2. Check if the database exists: mysql -u root -p -e "SHOW DATABASES;"
    echo.
    pause
    exit /b 1
)

echo Database access successful!
echo.

echo Testing tables...
mysql -u notekeeper -ppassword notekeeper -e "SELECT COUNT(*) as user_count FROM users; SELECT COUNT(*) as note_count FROM notes;" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Tables not found or corrupted
    echo.
    echo Possible solutions:
    echo 1. Run setup-database.bat to recreate the database
    echo 2. Check the database/init.sql file
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Database test completed successfully!
echo ========================================
echo.
echo The database is properly configured and ready to use.
echo You can now start the application.
echo.
pause



