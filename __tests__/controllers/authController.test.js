const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let mongoServer;

beforeAll(async () => {
  // Create an in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set environment variables for testing
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-secret-key';
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Clear all users before each test
  await User.deleteMany({});
});

afterAll(async () => {
  // Disconnect and stop MongoDB server after tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Controller', () => {
  describe('POST /api/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/register')
        .send(userData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered');
      
      // Verify user is saved in database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).not.toBeNull();
      expect(savedUser.email).toBe(userData.email);
    });
    
    test('should return error when registering with duplicate email', async () => {
      // Create a user first
      await User.create({
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      
      // Try to register with the same email
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'existing@example.com',
          password: 'newpassword123'
        });
      
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/login', () => {
    test('should login with valid credentials and return token', async () => {
      // Create a test user first
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email: 'login@example.com',
        password: hashedPassword
      });
      
      // Try to login
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: password
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      // Verify the token can be decoded with our secret key
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decodedToken).toHaveProperty('id');
    });
    
    test('should return 404 when user is not found', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
    
    test('should return 400 when password is incorrect', async () => {
      // Create a test user first
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'wrongpwd@example.com',
        password: hashedPassword
      });
      
      // Try to login with wrong password
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'wrongpwd@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});