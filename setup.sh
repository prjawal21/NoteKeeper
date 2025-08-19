#!/bin/bash

echo "🚀 Setting up NoteKeeper - Full Stack Note Taking Application"
echo "=============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17+ first."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed!"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd ../backend
mvn clean install
echo "✅ Backend dependencies installed!"

# Database setup instructions
echo ""
echo "🗄️  Database Setup Required:"
echo "============================"
echo "1. Make sure MySQL is running"
echo "2. Create database and user:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE notekeeper;"
echo "   CREATE USER 'notekeeper'@'localhost' IDENTIFIED BY 'password';"
echo "   GRANT ALL PRIVILEGES ON notekeeper.* TO 'notekeeper'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "3. Run the database initialization script:"
echo "   mysql -u notekeeper -p notekeeper < database/init.sql"
echo ""

# Start instructions
echo "🚀 To start the application:"
echo "============================"
echo "1. Start the backend:"
echo "   cd backend && mvn spring-boot:run"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📝 Demo credentials: Use any email and password (6+ characters)"
echo ""
echo "🎉 Setup complete! Happy note-taking!"
