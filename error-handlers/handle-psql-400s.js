function handlePSQL400s(err, req, res, next) {
  if (err.code === '22P02') {
    // invalid input type - requested ID is not a number
    res.status(400).send({ message: 'Invalid ID' });
  } else if (err.code === '23503') {
    // Primary Key ID referenced during insert/update does not exist
    res.status(404).send({ message: `ID does not exist` });
  } else {
    next(err);
  }
}

module.exports = handlePSQL400s;
