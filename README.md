# Equipment Management System

A comprehensive full-stack web application for managing laboratory equipment, borrowing requests, and equipment issuance. Built with Spring Boot backend and React frontend with JWT-based authentication.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Features](#features)
- [Troubleshooting](#troubleshooting)

## Overview

The Equipment Management System is designed to streamline the process of managing laboratory equipment and handling borrow requests. It provides:

- **User Management**: Registration, login, and profile management
- **Equipment Catalog**: Browse and search laboratory equipment
- **Borrow Requests**: Submit and manage equipment borrowing requests
- **Admin Dashboard**: Manage issuance, equipment, and borrowing requests
- **Laboratory Management**: Create and manage laboratory spaces
- **Role-Based Access Control**: Admin and user roles with different permissions

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.7
- **Security**: Spring Security 6.5.6 with JWT
- **ORM**: Hibernate 6.6.33
- **Database**: MySQL 8.0.42 (Primary) / H2 (Testing)
- **Connection Pool**: HikariCP
- **Build Tool**: Maven 3.6.3
- **Java**: JDK 11+

### Frontend
- **Library**: React 18+
- **Build Tool**: Vite 6.0+
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **Package Manager**: npm

### Database
- **Primary**: MySQL 8.0.42 (Port 3307)
- **Connection Pool**: HikariCP with 10 connections
- **Default Database**: `equipment_db`

## Prerequisites

Before you begin, ensure you have installed:

- **Java 11+** ([Download](https://adoptopenjdk.net/))
- **Maven 3.6.3+** ([Download](https://maven.apache.org/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **MySQL 8.0+** ([Download](https://dev.mysql.com/downloads/mysql/))

### Verify Installation

```bash
java -version
mvn -version
node --version
npm --version
mysql --version
```

## Project Structure

```
Equipment_Management_System/
├── backend/
│   └── demo/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/equipment/Management/System/demo/
│       │   │   │   ├── config/           # Configuration classes
│       │   │   │   ├── controller/       # REST API endpoints
│       │   │   │   ├── dto/              # Data Transfer Objects
│       │   │   │   ├── filter/           # JWT filter and security
│       │   │   │   ├── model/            # Entity classes
│       │   │   │   ├── repository/       # Database repositories
│       │   │   │   ├── security/         # Security configuration
│       │   │   │   ├── service/          # Business logic
│       │   │   │   ├── util/             # Utility classes
│       │   │   │   └── DemoApplication.java
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       ├── pom.xml                      # Maven dependencies
│       ├── mvnw / mvnw.cmd              # Maven wrapper
│       └── target/
├── frontend/
│   └── frontend/
│       ├── src/
│       │   ├── components/              # Reusable components
│       │   ├── Pages/                   # Page components
│       │   ├── routes/                  # Route configurations
│       │   ├── App.jsx                  # Main app component
│       │   └── main.jsx
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── node_modules/
├── README.md                           # This file
├── diagnose_mysql.bat                  # MySQL diagnostics script
├── reset_mysql.bat                     # MySQL reset script
└── reset_mysql_password.bat           # MySQL password reset script
```

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Equipment_Management_System
```

### Step 2: MySQL Database Setup

1. **Start MySQL Server**:
   ```bash
   # Windows (if MySQL is installed as service)
   net start MySQL80
   
   # Or run MySQL Server directly
   ```

2. **Reset MySQL (if needed)**:
   ```bash
   # Windows batch file
   reset_mysql.bat
   ```

3. **Create Database** (Manual):
   ```sql
   mysql -u root -proot
   CREATE DATABASE IF NOT EXISTS equipment_db;
   USE equipment_db;
   ```

### Step 3: Backend Setup

```bash
cd backend/demo

# Clear Maven cache and dependencies
mvn clean

# Install dependencies
mvn install

# Compile project
mvn compile
```

### Step 4: Frontend Setup

```bash
cd frontend/frontend

# Install dependencies
npm install

# Verify installation
npm list
```

## Running the Application

### Method 1: Development Mode

#### Terminal 1 - Backend (Port 8080)

```bash
cd backend/demo
mvn spring-boot:run
```

Or with specific database credentials:

```bash
mvn spring-boot:run "-Dspring-boot.run.arguments=--spring.datasource.username=root --spring.datasource.password=root"
```

#### Terminal 2 - Frontend (Port 5173)

```bash
cd frontend/frontend
npm run dev
```

#### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html (if enabled)

### Method 2: Production Build

#### Build Backend

```bash
cd backend/demo
mvn clean package -DskipTests
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

#### Build Frontend

```bash
cd frontend/frontend
npm run build
npm run preview
```

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

### Equipment Endpoints

#### Get All Equipment
```http
GET /api/equipment
Authorization: Bearer {token}
```

#### Get Equipment by ID
```http
GET /api/equipment/{id}
Authorization: Bearer {token}
```

#### Create Equipment (Admin only)
```http
POST /api/equipment
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Microscope",
  "description": "Electronic microscope",
  "category": "Optical",
  "quantity": 5,
  "laboratory": 1
}
```

### Borrow Request Endpoints

#### Get All Borrow Requests (Admin)
```http
GET /api/borrow-requests
Authorization: Bearer {token}
```

#### Create Borrow Request
```http
POST /api/borrow-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "equipment": 1,
  "borrower": 2,
  "borrowDate": "2024-04-15",
  "returnDate": "2024-04-20"
}
```

#### Update Borrow Request Status (Admin)
```http
PATCH /api/borrow-requests/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "APPROVED"
}
```

### Laboratory Endpoints

#### Get All Laboratories
```http
GET /api/laboratories
Authorization: Bearer {token}
```

#### Create Laboratory (Admin only)
```http
POST /api/laboratories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Lab A",
  "location": "Building 1",
  "capacity": 30
}
```

## Authentication

### JWT Token Flow

1. **User Login**: Submit credentials to `/api/auth/login`
2. **Token Generation**: Server validates credentials and returns JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **Token Usage**: Include token in Authorization header: `Bearer {token}`
5. **Token Validation**: Backend validates token via `JwtFilter` on each request
6. **Role Normalization**: JWT filter normalizes role format (ADMIN → ROLE_ADMIN)
7. **Authorization**: SecurityConfig checks role-based permissions

### Token Structure

```
Header.Payload.Signature

Payload contains:
{
  "sub": "username",
  "role": "ADMIN",
  "iat": 1775973724,
  "exp": 1776060124
}
```

### Security Features

- **JWT Signing**: HS256 algorithm
- **Token Expiration**: 24 hours
- **CORS Configuration**: Origins: http://localhost:3000, http://localhost:*
- **CSRF Protection**: Stateless authentication
- **Password Encoding**: BCrypt with strength 10

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Equipment Table
```sql
CREATE TABLE equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  quantity INT NOT NULL,
  laboratory_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (laboratory_id) REFERENCES laboratories(id)
);
```

### Borrow Requests Table
```sql
CREATE TABLE borrow_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipment_id INT NOT NULL,
  borrower_id INT NOT NULL,
  borrow_date DATE NOT NULL,
  return_date DATE NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (borrower_id) REFERENCES users(id)
);
```

### Laboratories Table
```sql
CREATE TABLE laboratories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features

### User Features
- ✅ User registration and authentication
- ✅ Browse equipment catalog
- ✅ View equipment details
- ✅ Submit borrow requests
- ✅ View own profile
- ✅ Manage personal borrow requests

### Admin Features
- ✅ Admin dashboard
- ✅ Manage equipment (CRUD operations)
- ✅ Manage laboratories
- ✅ View all borrow requests
- ✅ Approve/reject borrow requests
- ✅ Track equipment issuance
- ✅ User management

### System Features
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ CORS support
- ✅ MySQL database integration
- ✅ Responsive UI with Tailwind CSS
- ✅ RESTful API architecture

## Troubleshooting

### Authentication Issues

#### 403 Forbidden Error
**Problem**: Getting 403 response when accessing protected endpoints

**Solution**:
1. Verify token is valid: Check token expiration
2. Check Authorization header format: Must be `Bearer {token}`
3. Ensure JWT filter is processing tokens correctly
4. Verify role format in token (ADMIN vs ROLE_ADMIN)

#### Login Failures
**Problem**: Cannot login, getting 401 Unauthorized

**Solution**:
1. Verify MySQL is running
2. Check database connection in `application.properties`
3. Ensure user exists in database
4. Verify password is correct (case-sensitive)

### Database Connection Issues

#### Connection Timeout
**Problem**: `java.sql.SQLException: Cannot get a connection, pool error`

**Solution**:
```bash
# Restart MySQL
net stop MySQL80
net start MySQL80

# Or reset database
reset_mysql.bat
```

#### Port Already in Use (Port 8080)
**Problem**: Backend fails with "Address already in use"

**Solution** (PowerShell):
```powershell
$procIds = Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess -Unique
if ($procIds) {
  foreach ($procId in $procIds) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}
```

#### Port Already in Use (Port 5173)
**Problem**: Frontend fails with "Port 5173 already in use"

**Solution**:
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 5174
```

### Build Issues

#### Maven Build Failure
**Problem**: `mvn clean install` fails

**Solution**:
```bash
# Clear cache
mvn clean

# Update dependencies
mvn -U clean install

# Skip tests if needed
mvn clean install -DskipTests
```

#### NPM Installation Issues
**Problem**: `npm install` fails or takes too long

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

#### Routes Not Found Warning
**Problem**: "No routes matched location" warning in console

**Solution**:
1. Check route definitions in `App.jsx`
2. Ensure nested routes are properly configured
3. Verify protected routes are wrapped with ProtectedRoute

#### CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check CORS configuration in `SecurityConfig.java`
2. Verify allowed origins include frontend URL
3. Check if requests include credentials (withCredentials=true)

### Performance Issues

#### Slow Login Response
**Problem**: Login takes more than 3 seconds

**Solution**:
1. Check database connection performance
2. Monitor MySQL: `SHOW PROCESSLIST;`
3. Check backend logs for slow queries

#### Frontend Page Load Delay
**Problem**: Pages take long to load

**Solution**:
1. Check network tab in DevTools
2. Verify backend is responding
3. Check for slow API endpoints

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## Support

For issues and questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review application logs in `backend/demo/target/`
3. Check browser console for frontend errors
4. Verify database status: `SHOW STATUS;`

## License

This project is licensed under the MIT License.

---

**Last Updated**: April 2026
**Version**: 1.0.0
