const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const User = require('../../models/User');

let mongoServer;
let testUser;
let validToken;

beforeAll(async () => {
  // Create an in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set environment variables for testing
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-secret-key';
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
  
  // Create a test user for auth tests
  testUser = await User.create({
    email: 'middleware@example.com',
    password: 'password123'
  });
  
  // Create a valid token for this user
  validToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  // Disconnect and stop MongoDB server after tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication Middleware', () => {
  test('should allow access to protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain(testUser._id.toString());
  });
  
  test('should deny access when no token is provided', async () => {
    const response = await request(app).get('/api/protected');
    
    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('error', 'Access denied. No token provided or malformed header.');
  });
  
  test('should deny access with malformed authorization header', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'InvalidFormat');
    
    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('error', 'Access denied. No token provided or malformed header.');
  });
  
  test('should deny access with invalid token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalidtoken123');
    
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid or expired token.');
  });
});