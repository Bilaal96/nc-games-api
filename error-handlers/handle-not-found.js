function handleNotFound(req, res, next) {
  res
    .status(404)
    .send({ status: 404, message: 'The requested route does not exist' });
}

module.exports = handleNotFound;
