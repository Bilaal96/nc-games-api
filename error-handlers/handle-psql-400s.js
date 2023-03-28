function handlePSQL400s(err, req, res, next) {
  // PSQL - invalid input type
  if (err.code === '22P02') {
    res.status(400).send({ message: 'Invalid ID' });
  } else {
    next(err);
  }
}

module.exports = handlePSQL400s;
