function handleCustomError(err, req, res, next) {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
}

module.exports = handleCustomError;
