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

describe('GET /api/reviews', () => {
  it('200: returns array of review objects', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then((response) => {
        const { reviews } = response.body;
        expect(reviews).toBeInstanceOf(Array);

        // length of reviewData.length
        expect(reviews).toHaveLength(13);
        reviews.forEach((review) => {
          expect(review).toMatchObject({
            review_id: expect.any(Number),
            title: expect.any(String),
            review_body: expect.any(String),
            designer: expect.any(String),
            review_img_url: expect.any(String),
            votes: expect.any(Number),
            category: expect.any(String),
            owner: expect.any(String),
            created_at: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });

  it('200: comment_count property should return the total number of comments related to a single review_id', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then((response) => {
        const { reviews } = response.body;

        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13); // reviewData.length

        reviews.forEach((review) => {
          // count num of comments per review
          const commentCount = commentData.reduce((count, comment) => {
            if (comment.review_id === review.review_id) {
              count++;
            }
            return count;
          }, 0);

          // check if comment_count was calculated correctly
          expect(review.comment_count).toBe(commentCount);
        });
      });
  });

  it('200: returns array of review objects sorted by created_at in descending order (newest first)', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then((response) => {
        const { reviews } = response.body;

        expect(reviews).toHaveLength(13);
        expect(reviews).toBeSortedBy('created_at', { descending: true });
      });
  });
});

describe('GET /api/reviews/:review_id/comments', () => {
  it('200: returns an empty array if no comments exist for the requested review_id', () => {
    return request(app)
      .get('/api/reviews/1/comments')
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments).toEqual([]);
      });
  });

  it('200: returns an array of comments for the requested review_id', () => {
    return request(app)
      .get('/api/reviews/2/comments')
      .expect(200)
      .then((response) => {
        const { comments } = response.body;

        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(3);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            review_id: 2,
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            created_at: expect.any(String),
          });
        });
      });
  });

  // When sorting dates, to get newest date/most recent time first, sort in descending order
  it('200: returns array of comments sorted with most recent comments first - i.e. descending order', () => {
    return request(app)
      .get('/api/reviews/2/comments')
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(3);
        expect(comments).toBeSortedBy('created_at', { descending: true });
      });
  });

  it('400: responds with an error when the provided ID is not a number', () => {
    return request(app)
      .get('/api/reviews/not-a-number/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe('Invalid ID');
      });
  });

  it('404: responds with an error when the provided ID does not exist', () => {
    return request(app)
      .get('/api/reviews/99999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          'The review (for which comments were requested) does not exist'
        );
      });
  });
});
