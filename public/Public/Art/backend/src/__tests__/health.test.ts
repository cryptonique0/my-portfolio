import request from 'supertest';
import express from 'express';

describe('Health Check Endpoint', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    });
  });

  it('should return 200 OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  it('should return correct status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.status).toBe('ok');
  });

  it('should include timestamp', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body.timestamp).toBeDefined();
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});
