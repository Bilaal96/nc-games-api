function handleServerError(err, req, res, next) {
  // Range: 500 - 599
  if (err.status >= 500) {
    res.status(err.status).send(err.message);
  }
}

module.exports = handleServerError;
