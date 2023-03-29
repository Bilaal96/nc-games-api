const express = require('express');

// Controllers
const { getCategories } = require('./controllers/categories.controller');
const {
  getReviewById,
  getReviews,
  getCommentsByReviewId,
  postCommentByReviewId,
  patchVotesByReviewId,
} = require('./controllers/reviews.controller');

// Error handling middleware
const {
  handleRouteNotFound,
  handleCustomError,
  handleServerError,
  handlePSQL400s,
} = require('./error-handlers');

const app = express();

app.use(express.json());

app.get('/api/categories', getCategories);

app.get('/api/reviews/:review_id', getReviewById);

app.get('/api/reviews', getReviews);

app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);

app.post('/api/reviews/:review_id/comments', postCommentByReviewId);

app.patch('/api/reviews/:review_id', patchVotesByReviewId);

// error handlers
app.use('*', handleRouteNotFound);
app.use(handlePSQL400s);
app.use(handleCustomError);
app.use(handleServerError);

module.exports = app;
