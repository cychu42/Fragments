const request = require('supertest');

const app = require('../../src/app');
const hash = require('../../src/hash');

describe('Get /v1/fragments/:id', () => {
  const id = '4dcc65b6';
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${id}`).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get(`/v1/fragments/${id}`)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should give a success result
  test('authenticated users can get a fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment')
      .set('Content-Type', 'text/plain');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe('This is a fragment');
    expect(getByIdRes.get('Content-Type')).toBe('text/plain');
  });

  // Using a valid username/password pair asking for text/plain should give a success result
  test('authenticated users can get a text/plain fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment')
      .set('Content-Type', 'text/plain');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe('This is a fragment');
    expect(getByIdRes.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  test('nonexistent fragment id should return 404 error', async () => {
    const getByIdRes = await request(app)
      .get('/v1/fragments/555')
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(404);

    const text = JSON.parse(getByIdRes.text);
    expect(text.status).toBe('error');
    expect(text.error.code).toEqual(404);
    expect(text.error.message).toBe('The fragment data for 555 cannot be found.');
  });

  test('unsupported types should return 415 error', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment')
      .set('Content-Type', 'text/plain');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.kjhjkkj`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(415);

    const text = JSON.parse(getByIdRes.text);
    expect(text.status).toBe('error');
    expect(text.error.code).toBe(415);
    expect(text.error.message).toBe(
      'Content-Type is not supported; sending an error from POST /v1/fragments'
    );
  });

  // test('authenticated users get a fragment back with correct type, created, updated, size, id, ownerId, and Location header', async () => {
  //   const reqContentType = 'text/plain';
  //   const reqEmail = 'user1@email.com';
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth(reqEmail, 'password1')
  //     .send('This is a fragment')
  //     .set('Content-Type', reqContentType);
  //   expect(res.body.fragment.type).toEqual(reqContentType);
  //   expect(res.body.fragment.created).toEqual(res.body.fragment.updated);
  //   expect(res.get('Location').endsWith(`/v1/fragments/${res.body.fragment.id}`)).toBe(true);
  //   expect(res.body.fragment.size).toEqual(expect.any(Number));
  //   expect(res.body.fragment.id).toEqual(expect.any(String));
  //   expect(res.body.fragment.ownerId).toEqual(hash(reqEmail));
  // });
  // test('trying to create a fragment with an unsupported type returns a 415 error message', async () => {
  //   const res = await request(app)
  //     .post('/v1/fragments')
  //     .auth('user1@email.com', 'password1')
  //     .send('This is a fragment')
  //     .set('Content-Type', 'bad/type');
  //   expect(res.statusCode).toBe(415);
  //   expect(res.body.status).toBe('error');
  //   expect(res.body.error).toEqual(expect.any(Object));
  // });
});
