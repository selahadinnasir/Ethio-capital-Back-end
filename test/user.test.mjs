import request from 'supertest';
// import app from "../app.js"; // your Express app
import index from '../index.js';
describe('User Registration', () => {
  it('should register a user with valid inputs', async () => {
    const res = await request(app).post('/api/v1/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      role: 'investor',
    });

    expect(res.statusCode).toBe(200); // or 201 depending on your code
    expect(res.body).toHaveProperty('message'); // check for success message
  });
});
