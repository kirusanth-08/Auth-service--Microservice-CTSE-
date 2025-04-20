const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
});

beforeEach(async () => {
  // Clear users and create a fresh test user before each test
  await User.deleteMany({});
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  testUser = await User.create({
    email: 'user@example.com',
    password: hashedPassword
  });
  
  // Create a valid token for this user
  validToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  // Disconnect and stop MongoDB server after tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Controller', () => {
  describe('GET /api/profile', () => {
    test('should return user profile when authenticated with valid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'User profile fetched successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    test('should return 404 when user does not exist anymore', async () => {
      // Create a token for a user that will be deleted
      const tempUser = await User.create({
        email: 'temp@example.com',
        password: 'temppassword'
      });
      
      const tempToken = jwt.sign({ id: tempUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      // Delete the user but keep the token
      await User.findByIdAndDelete(tempUser._id);
      
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${tempToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
    
    test('should return error on server exception', async () => {
      // Create a broken token with valid format but non-existent user ID
      const brokenToken = jwt.sign(
        { id: new mongoose.Types.ObjectId() }, // Valid ObjectId that doesn't exist
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${brokenToken}`);
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });
});