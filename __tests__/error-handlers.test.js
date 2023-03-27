const request = require('supertest');
const app = require('../app');

describe('handleNotFound()', () => {
  it('404: returns error object with message when route does not exist', () => {
    return request(app)
      .get('/does-not-exist')
      .expect(404)
      .then((response) => {
        const error = response.body;
        expect(error.status).toBe(404);
        expect(error.message).toBe('The requested route does not exist');
      });
  });
});

describe('handleCustomErrors()', () => {
  it.todo('Custom: returns an custom error object with message & status code');
});
