function handleServerError(err, req, res, next) {
  // Range: 500 - 599
  if (err.status >= 500) {
    res.status(err.status).send('Internal Server Error');
  }
}

module.exports = handleServerError;
