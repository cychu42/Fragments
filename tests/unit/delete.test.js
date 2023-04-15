const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/123').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments/123')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated user can delete their existing fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ content: 'This is a fragment' })
      .set('Content-Type', 'application/json');
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });

  test('authenticated user cannot delete nonexistent fragment', async () => {
    const deleteRes = await request(app)
      .delete(`/v1/fragments/1234`)
      .auth('user1@email.com', 'password1');
    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.body.status).not.toBe('ok');
  });

  test('authenticated user cannot delete existing fragment of another user', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ content: 'This is a fragment' })
      .set('Content-Type', 'application/json');
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('user2@email.com', 'password2');
    expect(deleteRes.statusCode).toBe(404);
    expect(deleteRes.body.status).not.toBe('ok');
  });
});
