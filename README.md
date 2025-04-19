# Authentication Service

A Node.js RESTful API for user authentication with JWT token-based authentication.

## Features

- User registration
- User login with JWT authentication
- Secure password hashing using bcrypt
- MongoDB database integration
- Containerized with Docker
- CI/CD with GitHub Actions

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Docker (optional, for containerization)

## Installation

1. Clone the repository:
   ```
   git clone <your-repository-url>
   cd auth-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=3000
     ```

## Usage

### Start the server

```
npm start
```

Server will run on http://localhost:3000 (or the port specified in your .env file)

### API Endpoints

- **Register a new user**
  - `POST /api/register`
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```

- **Login**
  - `POST /api/login`
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
  - Response:
    ```json
    {
      "token": "jwt_token_here"
    }
    ```

## Docker

Build and run the Docker container:

```
docker build -t auth-service .
docker run -p 3000:3000 -d auth-service
```

## Project Structure

```
.
├── app.js                # Application entry point
├── package.json          # Project dependencies
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── Dockerfile            # Docker configuration
├── controllers/          # Controllers
│   └── authController.js # Authentication controller
├── models/               # Database models
│   └── User.js           # User model
├── routes/               # API routes
│   └── authRoutes.js     # Authentication routes
└── middlewares/          # Custom middleware functions
```

## Development

This project follows standard Node.js development practices. To extend the service:

1. Add new routes in the `routes` directory
2. Create controllers for business logic in the `controllers` directory
3. Add models for database schemas in the `models` directory

## Deployment

The project includes a GitHub Actions workflow for CI/CD in `.github/workflows/node.yml`. Update this file to fit your deployment needs.