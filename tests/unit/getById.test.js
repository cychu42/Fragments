const request = require('supertest');
var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();

const app = require('../../src/app');

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
  test('authenticated users can get a fragment of the original type', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ content: 'This is a fragment' })
      .set('Content-Type', 'application/json');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe('{"content":"This is a fragment"}');
    expect(getByIdRes.get('Content-Type')).toBe('application/json');
  });

  // Using a valid username/password pair asking for text/plain should give a success result
  test('Authenticated users can ask for and get a text/plain fragment', async () => {
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
    expect(getByIdRes.get('Content-Type')).toBe('text/plain');
  });

  test('A text/html fragment can be converted from text/markdown fragment', async () => {
    const markdown = '# This is a fragment';
    const html = md.render(markdown);
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(markdown)
      .set('Content-Type', 'text/markdown');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe(html);
    expect(getByIdRes.get('Content-Type')).toBe('text/html; charset=utf-8');
  });

  test('A text/plain fragment can be converted from text/markdown fragment', async () => {
    const markdown = '# This is a fragment';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(markdown)
      .set('Content-Type', 'text/markdown');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe('# This is a fragment');
    expect(getByIdRes.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  test('A text/plain fragment can be converted from text/html fragment', async () => {
    const markdown = '# This is a fragment';
    const html = md.render(markdown);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(html)
      .set('Content-Type', 'text/html');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe(html.toString());
    expect(getByIdRes.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  test('A text/plain fragment can be converted from application/json fragment', async () => {
    const json = { content: 'This is a fragment' };
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(json)
      .set('Content-Type', 'application/json');
    const getByIdRes = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(getByIdRes.statusCode).toBe(200);
    expect(getByIdRes.text).toBe(JSON.stringify(json).replace(/["]+/g, ''));
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
  });
});
