const request = require('supertest');

const app = require('../../src/app');

describe('404 middleware', () => {
  test('404 message shows on nonexistent route', () =>
    request(app).get('/nonexistent').expect(404));
});
