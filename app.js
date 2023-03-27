const express = require('express');
const { getCategories } = require('./controllers/categories.controller');
const { handleServerError, handleNotFound } = require('./error-handlers');

const app = express();

app.get('/api/categories', getCategories);

// error handlers
app.use('*', handleNotFound);
app.use(handleServerError);

module.exports = app;
