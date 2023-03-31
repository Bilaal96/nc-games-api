const express = require('express');
const fs = require('fs/promises');

// Controllers
const { getCategories } = require('./controllers/categories.controller');
const {
  getReviewById,
  getReviews,
  getCommentsByReviewId,
  postCommentByReviewId,
  patchVotesByReviewId,
  deleteCommentByCommentId,
} = require('./controllers/reviews.controller');
const { getUsers } = require('./controllers/users.controller');

// Error handling middleware
const {
  handleRouteNotFound,
  handleCustomError,
  handleServerError,
  handlePSQL400s,
} = require('./error-handlers');

const app = express();

app.use(express.json());

// Get summary of API endpoints
app.get('/api', (req, res, next) => {
  fs.readFile(`${__dirname}/endpoints.json`, 'utf-8')
    .then((fileContents) => {
      res.status(200).send({ endpoints: fileContents });
    })
    .catch((err) => {
      next({ status: 500, message: 'Server failed to read endpoints data' });
    });
});

// Categories
app.get('/api/categories', getCategories);

// Reviews
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/reviews', getReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);
app.post('/api/reviews/:review_id/comments', postCommentByReviewId);
app.patch('/api/reviews/:review_id', patchVotesByReviewId);
app.delete('/api/comments/:comment_id', deleteCommentByCommentId);

// Users
app.get('/api/users', getUsers);

// Error handlers
app.use('*', handleRouteNotFound);
app.use(handlePSQL400s);
app.use(handleCustomError);
app.use(handleServerError);

module.exports = app;
