const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated users gets an empty array if no fragment belongs to them', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([]);
  });

  test('authenticated users gets a list of fragment IDs back, if no valid expand is used', async () => {
    const reqContentType = 'text/plain';
    const reqEmail = 'user1@email.com';
    const reqPW = 'password1';

    const result1 = await request(app)
      .post('/v1/fragments')
      .auth(reqEmail, reqPW)
      .send('This is fragment1')
      .set('Content-Type', reqContentType);
    const result2 = await request(app)
      .post('/v1/fragments')
      .auth(reqEmail, reqPW)
      .send('This is fragment2')
      .set('Content-Type', reqContentType);
    const res = await request(app).get('/v1/fragments?expand=2562').auth(reqEmail, reqPW);

    expect(res.body.fragments.length).toBe(2);
    expect(res.body.fragments[0]).toEqual(result1.body.fragment.id);
    expect(res.body.fragments[1]).toEqual(result2.body.fragment.id);
  });

  test('authenticated users get an expanded list of fragments back with correct type, created, updated, size, id, and ownerId', async () => {
    const reqContentType = 'text/plain';
    const reqEmail = 'user1@email.com';
    const reqPW = 'password1';

    await request(app)
      .post('/v1/fragments')
      .auth(reqEmail, reqPW)
      .send('This is a fragment')
      .set('Content-Type', reqContentType);

    const res = await request(app).get('/v1/fragments?expand=1').auth(reqEmail, reqPW);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments[0].type).toEqual(reqContentType);
    expect(Date.parse(res.body.fragments[0].created)).toBeCloseTo(
      Date.parse(res.body.fragments[0].updated),
      -3
    );
    expect(res.body.fragments[0].size).toEqual(17);
    expect(res.body.fragments[0].id).toEqual(expect.any(String));
    expect(res.body.fragments[0].ownerId).toEqual(hash(reqEmail));
  });
});
