const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  const id = '4dcc65b6';
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).put(`/v1/fragments/${id}`).expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .put(`/v1/fragments/${id}`)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users cannot update a nonexistent fragment', async () => {
    const updateRes = await request(app)
      .put(`/v1/fragments/1234`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ content: 'This is not a fragment' });

    expect(updateRes.statusCode).toBe(404);
    const text = JSON.parse(updateRes.text);
    expect(text.error.message).toBe('The fragment data for 1234 cannot be found.');
  });

  test('authenticated users cannot change data type', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ content: 'This is a fragment' })
      .set('Content-Type', 'application/json');
    const updateRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a text');

    expect(updateRes.statusCode).toBe(400);
    const text = JSON.parse(updateRes.text);
    expect(text.error.message).toBe("A fragment's type can not be changed after it is created.");
  });

  test('authenticated users can update their fragment data', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ content: 'This is a fragment' })
      .set('Content-Type', 'application/json');

    const updateRes = await request(app)
      .put(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ content: 'This is two fragment' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('ok');
    expect(updateRes.body.fragment).toEqual(expect.any(Object));
    expect(updateRes.body.fragment.type).toBe('application/json');
    expect(updateRes.body.fragment.createdAt).toEqual(postRes.body.fragment.createdAt);
  });
});
