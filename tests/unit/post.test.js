const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result
  test('authenticated users can create a text/plain fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment')
      .set('Content-Type', 'text/plain');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('authenticated users can create a application/json fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ content: 'This is a fragment' })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('application/json');
  });

  test('authenticated users can create a text/markdown fragment', async () => {
    const markdown = '# This is a fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(markdown)
      .set('Content-Type', 'text/markdown');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('text/markdown');
  });

  test('authenticated users can create a text/html fragment', async () => {
    const html = '<b> This is a fragment </b>';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(html)
      .set('Content-Type', 'text/html');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('text/html');
  });

  test('authenticated users can create a image/png fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('image/png');
  });

  test('authenticated users can create a image/jpeg fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('image/jpeg');
  });

  test('authenticated users can create a image/webp fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/webp');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('image/webp');
  });

  test('authenticated users can create a image/gif fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/gif');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(expect.any(Object));
    expect(res.body.fragment.type).toBe('image/gif');
  });

  test('authenticated users get a fragment back with correct type, created, updated, size, id, ownerId, and Location header', async () => {
    const reqContentType = 'text/plain';
    const reqEmail = 'user1@email.com';
    const res = await request(app)
      .post('/v1/fragments')
      .auth(reqEmail, 'password1')
      .send('This is a fragment')
      .set('Content-Type', reqContentType);
    expect(res.body.fragment.type).toEqual(reqContentType);
    expect(Date.parse(res.body.fragment.created)).toBeCloseTo(
      Date.parse(res.body.fragment.updated),
      -3
    );
    expect(res.get('Location').endsWith(`/v1/fragments/${res.body.fragment.id}`)).toBe(true);
    expect(res.body.fragment.size).toEqual(18);
    expect(res.body.fragment.id).toEqual(expect.any(String));
    expect(res.body.fragment.ownerId).toEqual(hash(reqEmail));
  });

  test('trying to create a fragment with an unsupported type returns a 415 error message', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment')
      .set('Content-Type', 'bad/type');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error).toEqual(expect.any(Object));
  });
});
