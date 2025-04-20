const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

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

afterAll(async () => {
  // Disconnect and stop MongoDB server after tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Health Check Endpoint', () => {
  test('GET /health should return 200 and correct status info', async () => {
    const response = await request(app).get('/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'auth-service');
    expect(response.body).toHaveProperty('database', 'connected');
  });
});

describe('Server Configuration', () => {
  test('CORS should be configured', () => {
    // Verify CORS is set up in the app
    const corsMiddleware = app._router.stack.find(layer => 
      layer.name === 'corsMiddleware' || (layer.handle && layer.handle.name === 'corsMiddleware')
    );
    expect(corsMiddleware).toBeDefined();
  });

  test('Rate limiting should be enabled on API routes', () => {
    // Find the middleware that handles the '/api' path prefix
    const apiLimiterMiddleware = app._router.stack.find(layer => 
      layer.route === undefined && 
      layer.regexp && 
      layer.regexp.test('/api') &&
      layer.handle && 
      layer.handle.name === 'rateLimit'
    );
    expect(apiLimiterMiddleware).toBeDefined();
  });
});