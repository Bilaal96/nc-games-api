const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');

const testData = require('../db/data/test-data');
const { reviewData, commentData } = testData;

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('GET /api/categories', () => {
  it('200: returns an array of category objects', () => {
    return request(app)
      .get('/api/categories')
      .expect(200)
      .then((response) => {
        const { categories } = response.body;
        expect(categories).toBeInstanceOf(Array);

        // length should match categoryData.length
        expect(categories).toHaveLength(4);
        categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe('GET /api/reviews/:review_id', () => {
  it('200: returns a single review object with the given review_id', () => {
    return request(app)
      .get('/api/reviews/1')
      .expect(200)
      .then((response) => {
        const { review } = response.body;

        expect(review).toMatchObject({
          review_id: 1,
          title: 'Agricola',
          review_body: 'Farmyard fun!',
          designer: 'Uwe Rosenberg',
          review_img_url:
            'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700',
          votes: 1,
          category: 'euro game',
          owner: 'mallionaire',
          created_at: '2021-01-18T10:00:20.514Z',
        });
      });
  });

  it('400: responds with an error when review_id received is not a number', () => {
    return request(app)
      .get('/api/reviews/not-a-number')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Invalid ID');
      });
  });

  it('404: responds with an error when the provided review_id does not exist', () => {
    return request(app)
      .get('/api/reviews/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('The requested review does not exist');
      });
  });
});
