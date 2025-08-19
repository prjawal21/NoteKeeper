@echo off
echo 🚀 Setting up NoteKeeper - Full Stack Note Taking Application
echo ==============================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed. Please install Java 17+ first.
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven is not installed. Please install Maven first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Setup Frontend
echo.
echo 📦 Setting up Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend setup failed!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed!

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd ..\backend
call mvn clean install
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed!

echo.
echo 🗄️  Database Setup Required:
echo ============================
echo 1. Make sure MySQL is running
echo 2. Create database and user:
echo    mysql -u root -p
echo    CREATE DATABASE notekeeper;
echo    CREATE USER 'notekeeper'@'localhost' IDENTIFIED BY 'password';
echo    GRANT ALL PRIVILEGES ON notekeeper.* TO 'notekeeper'@'localhost';
echo    FLUSH PRIVILEGES;
echo    EXIT;
echo.
echo 3. Run the database initialization script:
echo    mysql -u notekeeper -p notekeeper ^< database/init.sql
echo.

echo 🚀 To start the application:
echo ============================
echo 1. Start the backend:
echo    cd backend ^&^& mvn spring-boot:run
echo.
echo 2. Start the frontend (in a new terminal):
echo    cd frontend ^&^& npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📝 Demo credentials: Use any email and password (6+ characters)
echo.
echo 🎉 Setup complete! Happy note-taking!
pause
