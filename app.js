const express = require('express');

// Controllers
const { getCategories } = require('./controllers/categories.controller');
const { getReviewById } = require('./controllers/reviews.controller');

// Error handling middleware
const { handleServerError, handleRouteNotFound } = require('./error-handlers');

const app = express();

app.get('/api/categories', getCategories);

app.get('/api/reviews/:review_id', getReviewById);

// error handlers
app.use('*', handleRouteNotFound);
app.use(handleServerError);

module.exports = app;
