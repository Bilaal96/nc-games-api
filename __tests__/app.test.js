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
  it('200: returns a single review object with the given review_id, with comment_count of 0', () => {
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
          created_at: new Date(1610964020514).toJSON(),
          comment_count: 0,
        });
      });
  });

  it('200: returns a single review object with the given review_id, with comment_count > 0', () => {
    return request(app)
      .get('/api/reviews/2')
      .expect(200)
      .then((response) => {
        const { review } = response.body;

        expect(review).toMatchObject({
          review_id: 2,
          title: 'Jenga',
          review_body: 'Fiddly fun for all the family',
          designer: 'Leslie Scott',
          review_img_url:
            'https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700',
          votes: 5,
          category: 'dexterity',
          owner: 'philippaclaire9',
          created_at: new Date(1610964101251).toJSON(),
          comment_count: 3,
        });
      });
  });

  it('400: responds with an error when review_id received is not a number', () => {
    return request(app)
      .get('/api/reviews/not-a-number')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Type of the provided value does not match the type expected in the related database field'
        );
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

  it('200: by default, returns array of review objects sorted by created_at in descending order (newest first)', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then((response) => {
        const { reviews } = response.body;

        expect(reviews).toHaveLength(13);
        expect(reviews).toBeSortedBy('created_at', { descending: true });
      });
  });

  describe('Filter by category: /api/reviews?category', () => {
    it('200: returns all reviews with the specified category', () => {
      return request(app)
        .get('/api/reviews?category=social+deduction')
        .expect(200)
        .then((response) => {
          const { reviews } = response.body;
          expect(reviews).toBeInstanceOf(Array);
          expect(reviews).toHaveLength(11);

          reviews.forEach((review) => {
            expect(review.category).toBe('social deduction');
          });
        });
    });

    it('200: returns empty array when there are no reviews with the specified category', () => {
      return request(app)
        .get("/api/reviews?category=children's+games")
        .expect(200)
        .then((response) => {
          const { reviews } = response.body;
          expect(reviews).toEqual([]);
        });
    });

    it('404: responds with an error when the specified category does not exist in categories table', () => {
      return request(app)
        .get('/api/reviews?category=non-existent')
        .expect(404)
        .then(({ body }) => {
          expect(body.message).toBe('Resource not found');
        });
    });
  });

  describe('Sort reviews by user-specified column_name & order (ascending/descending)', () => {
    it('200: returns reviews sorted by user-specified column_name in ascending order (by default)', () => {
      return request(app)
        .get('/api/reviews?sort_by=title')
        .expect(200)
        .then((response) => {
          const { reviews } = response.body;
          expect(reviews).toBeSortedBy('title');
        });
    });

    it('200: returns reviews sorted by user-specified column_name in ascending order (when order is explicitly passed)', () => {
      return request(app)
        .get('/api/reviews?sort_by=title&order=asc')
        .expect(200)
        .then((response) => {
          const { reviews } = response.body;
          expect(reviews).toBeSortedBy('title');
        });
    });

    it('200: returns reviews sorted by user-specified column_name in descending order', () => {
      return request(app)
        .get('/api/reviews?sort_by=title&order=desc')
        .expect(200)
        .then((response) => {
          const { reviews } = response.body;
          expect(reviews).toBeSortedBy('title', { descending: true });
        });
    });

    it('200: returns array of review objects sorted by created_at in ascending order (oldest first), when order=asc is specified without a sort_by query', () => {
      return request(app)
        .get('/api/reviews?order=asc')
        .expect(200)
        .then((response) => {
          const { reviews } = response.body;
          expect(reviews).toBeSortedBy('created_at');
        });
    });

    it("400: responds with an error when 'sort_by' does not have a valid value to query by", () => {
      return request(app)
        .get('/api/reviews?sort_by=invalid-sort')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid sort_by query');
        });
    });

    it("400: responds with an error when 'order' does not have a valid value to query by", () => {
      return request(app)
        .get('/api/reviews?order=invalid-order')
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe('Invalid order query');
        });
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
        expect(body.message).toBe(
          'Type of the provided value does not match the type expected in the related database field'
        );
      });
  });

  it('404: responds with an error when the provided ID does not exist', () => {
    return request(app)
      .get('/api/reviews/99999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Resource not found');
      });
  });
});

describe('POST /api/reviews/:review_id/comments', () => {
  it('201: successfully inserts a comment into the comments table, responds with the newly created comment', () => {
    const newComment = {
      username: 'mallionaire',
      body: 'I completely agree, this game is awesome!',
    };

    return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(201)
      .then((response) => {
        const { createdComment } = response.body;

        // test DB was seeded with 6 comments, so next id should be 7
        expect(createdComment).toMatchObject({
          comment_id: 7,
          author: 'mallionaire',
          body: 'I completely agree, this game is awesome!',
          review_id: 1,
          votes: 0,
          // string representation of date object
          created_at: expect.any(String),
        });
      });
  });

  it('400: responds with error when posted comment is in the incorrect format - missing keys', () => {
    const badComment = { username: 'mallionaire' };
    return request(app)
      .post('/api/reviews/1/comments')
      .send(badComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Invalid comment received - must only include the keys: username & body'
        );
      });
  });

  it('400: responds with error when posted comment is in the incorrect format - additional keys', () => {
    const badComment = {
      username: 'mallionaire',
      body: 'I completely agree, this game is awesome!',
      votes: 1000,
      admin: true,
      review_id: 100000,
    };

    return request(app)
      .post('/api/reviews/1/comments')
      .send(badComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Invalid comment received - must only include the keys: username & body'
        );
      });
  });

  it('400: responds with an error when the provided ID is not a number', () => {
    const newComment = {
      username: 'mallionaire',
      body: 'I completely agree, this game is awesome!',
    };

    return request(app)
      .post('/api/reviews/not-a-number/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Type of the provided value does not match the type expected in the related database field'
        );
      });
  });

  it('404: responds with an error when the provided ID does not exist', () => {
    const newComment = {
      username: 'mallionaire',
      body: 'I completely agree, this game is awesome!',
    };

    return request(app)
      .post('/api/reviews/99999/comments')
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('ID does not exist');
      });
  });
});

describe('PATCH /api/reviews/:review_id', () => {
  it('200: returns updated review, with vote property incremented by value of inc_votes (a positive integer)', () => {
    const testIncrementVote = { inc_votes: 5 };

    return request(app)
      .patch('/api/reviews/1')
      .send(testIncrementVote)
      .expect(200)
      .then((response) => {
        const { updatedReview } = response.body;

        expect(updatedReview).toEqual({
          review_id: 1,
          title: 'Agricola',
          review_body: 'Farmyard fun!',
          designer: 'Uwe Rosenberg',
          review_img_url:
            'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700',
          votes: 6, // was 1, updated to 6
          category: 'euro game',
          owner: 'mallionaire',
          created_at: new Date(1610964020514).toJSON(),
        });
      });
  });

  // NOTE: like Reddit's voting system, a negative integer is a valid value for votes
  it('200: returns updated review, with vote property decremented when value of inc_votes is a negative integer', () => {
    const testDecrementVote = { inc_votes: -2 };

    return request(app)
      .patch('/api/reviews/1')
      .send(testDecrementVote)
      .expect(200)
      .then((response) => {
        const { updatedReview } = response.body;

        expect(updatedReview).toEqual({
          review_id: 1,
          title: 'Agricola',
          review_body: 'Farmyard fun!',
          designer: 'Uwe Rosenberg',
          review_img_url:
            'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700',
          votes: -1, // was 1, updated to -1
          category: 'euro game',
          owner: 'mallionaire',
          created_at: new Date(1610964020514).toJSON(),
        });
      });
  });

  it('400: responds with an error when the increment value provided is not an integer', () => {
    const testBadIncrement = { inc_votes: 1.5 };

    return request(app)
      .patch('/api/reviews/1')
      .send(testBadIncrement)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Type of the provided value does not match the type expected in the related database field'
        );
      });
  });

  it('400: responds with an error when the provided ID is not a number', () => {
    const testIncrementVote = { inc_votes: 5 };

    return request(app)
      .patch('/api/reviews/not-a-number')
      .send(testIncrementVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Type of the provided value does not match the type expected in the related database field'
        );
      });
  });

  it('404: responds with an error when the provided ID does not exist', () => {
    const testIncrementVote = { inc_votes: 5 };

    return request(app)
      .patch('/api/reviews/99999')
      .send(testIncrementVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Resource not found');
      });
  });

  it('400: responds with an error when request body does not include inc_votes property', () => {
    const testEmptyRequestBody = {};

    return request(app)
      .patch('/api/reviews/1')
      .send(testEmptyRequestBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Value to increment votes by was not provided'
        );
      });
  });
});

describe('DELETE /api/comments/:comments_id', () => {
  it('204: successfully deletes a single comment, returns nothing in response', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then((response) => {
        // response.body should be an empty object
        expect(response.body).toEqual({});
      });
  });

  it('400: responds with an error when the provided ID is not a number', () => {
    return request(app)
      .delete('/api/comments/not-a-number')
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          'Type of the provided value does not match the type expected in the related database field'
        );
      });
  });

  it('404: responds with an error when the provided ID does not exist', () => {
    return request(app)
      .delete('/api/comments/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe('Resource not found');
      });
  });
});

describe('GET /api/users', () => {
  test('200: returns an array of user objects', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then((response) => {
        const { users } = response.body;
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);

        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
