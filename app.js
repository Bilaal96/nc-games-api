const express = require('express');

// Controllers
const { getCategories } = require('./controllers/categories.controller');
const {
  getReviewById,
  getReviews,
} = require('./controllers/reviews.controller');

// Error handling middleware
const {
  handleRouteNotFound,
  handleCustomError,
  handleServerError,
  handlePSQL400s,
} = require('./error-handlers');

const app = express();

app.get('/api/categories', getCategories);

app.get('/api/reviews/:review_id', getReviewById);

app.get('/api/reviews', getReviews);

// error handlers
app.use('*', handleRouteNotFound);
app.use(handlePSQL400s);
app.use(handleCustomError);
app.use(handleServerError);

module.exports = app;
