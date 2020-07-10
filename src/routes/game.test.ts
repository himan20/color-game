import request from 'supertest';
import app from '../app';

describe('/start', () => {
  it('starts a new game and returns valid data', async () => {
    const res = await request(app)
      .post('/start')
      .send({
        level: 0,
      });
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('data.matrix');
    expect(res.body).toHaveProperty('data.size');
    expect(res.body).toHaveProperty('isValid');
    expect(res.body.isValid).toBeTruthy();
    expect(res.body.data.matrix.length).toEqual(3 * 3);
    expect(res.body.data.size).toEqual(3);
    expect(new Set(res.body.data.matrix).size).toEqual(3);
  });

  it('start a game : return 404 when the level is invalid', async () => {
    const res = await request(app)
      .post('/start')
      .send({
        level: 3, // invalid level
      });

    expect(res.status).toEqual(404);
  });
});
