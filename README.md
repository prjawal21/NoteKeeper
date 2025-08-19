# Notes Application

A simple note-taking application built with React and Spring Boot.

## Prerequisites

- Node.js 18+ and npm
- Java 17+ and Maven
- MySQL 8.0+

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd notes
```

### 2. Set up the database
Run the initialization script:
```bash
# Windows
setup-database.bat

# Linux/macOS
./setup.sh
```

### 3. Start the backend
```bash
cd backend
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### 4. Start the frontend
In a new terminal:
```bash
cd frontend
npm install
npm start
```

The frontend will open in your browser at `http://localhost:3000`

## Project Structure

```
notes/
├── backend/           # Spring Boot backend
│   ├── src/           # Source code
│   └── pom.xml        # Maven configuration
├── frontend/          # React frontend
│   ├── public/        # Static files
│   ├── src/           # Source code
│   └── package.json   # Node dependencies
└── database/          # Database scripts
    └── init.sql       # Database schema
```

## Available Scripts

- `setup.bat` / `setup.sh` - Setup the development environment
- `reset-database.bat` - Reset the database
- `test-database.bat` - Test database connection
- `force-reset-db.bat` - Force reset the database (use with caution)

### Backend Setup

1. **Database Setup**
   ```sql
   CREATE DATABASE notekeeper;
   CREATE USER 'notekeeper'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON notekeeper.* TO 'notekeeper'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Configure Database**
   - Update `backend/src/main/resources/application.properties` with your database credentials

3. **Run Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Frontend**
   ```bash
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Notes
- `GET /api/notes` - Fetch all notes for logged-in user
- `GET /api/notes/{id}` - Fetch a single note by ID
- `POST /api/notes` - Create a new note
- `PUT /api/notes/{id}` - Update a note
- `DELETE /api/notes/{id}` - Delete a note

## Demo Credentials

For testing purposes, you can use any email and password (minimum 6 characters).

## Development

### Backend Development
- Run with `mvn spring-boot:run`
- API documentation available at `http://localhost:8080/swagger-ui.html`

### Frontend Development
- Run with `npm start`
- Hot reload enabled for development

## Deployment

### Backend Deployment
1. Build JAR: `mvn clean package`
2. Run: `java -jar target/notekeeper-backend-1.0.0.jar`

### Frontend Deployment
1. Build: `npm run build`
2. Serve the `build` folder with any static file server

## Security Features

- JWT-based authentication
- BCrypt password hashing
- CORS configuration
- Input validation and sanitization
- XSS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
