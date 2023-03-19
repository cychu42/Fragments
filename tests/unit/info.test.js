const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/1/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/1/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users can get metadata of their existing fragments', async () => {
    const reqContentType = 'text/plain';
    const reqEmail = 'user1@email.com';

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(reqEmail, 'password1')
      .send('This is a fragment')
      .set('Content-Type', reqContentType);

    const infoRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}/info`)
      .auth(reqEmail, 'password1');

    expect(infoRes.statusCode).toBe(200);
    expect(infoRes.body.status).toBe('ok');
    expect(infoRes.body.fragment.type).toEqual(reqContentType);
    expect(Date.parse(infoRes.body.fragment.created)).toBeCloseTo(
      Date.parse(infoRes.body.fragment.updated),
      -3
    );
    expect(infoRes.body.fragment.size).toEqual(18);
    expect(infoRes.body.fragment.id).toEqual(expect.any(String));
    expect(infoRes.body.fragment.ownerId).toEqual(hash(reqEmail));
  });

  test('authenticated users cannot get metadata of nonexistent fragments', async () => {
    const reqContentType = 'text/plain';
    const reqEmail = 'user1@email.com';

    await request(app)
      .post('/v1/fragments')
      .auth(reqEmail, 'password1')
      .send('This is a fragment')
      .set('Content-Type', reqContentType);

    const res = await request(app).get('/v1/fragments/256/info').auth(reqEmail, 'password1');

    const text = JSON.parse(res.text);
    expect(text.status).toBe('error');
    expect(text.error.code).toEqual(404);
    expect(text.error.message).toBe('The fragment data for 256 cannot be found.');
  });

  test("authenticated users cannot get metadata of other user's fragments", async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment')
      .set('Content-Type', 'text/plain');

    const infoRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}/info`)
      .auth('user2@email.com', 'password2');

    const text = JSON.parse(infoRes.text);
    expect(text.status).toBe('error');
    expect(text.error.code).toEqual(404);
    expect(text.error.message).toBe(
      `The fragment data for ${postRes.body.fragment.id} cannot be found.`
    );
  });
});
