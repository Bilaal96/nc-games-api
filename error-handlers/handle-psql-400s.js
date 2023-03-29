function handlePSQL400s(err, req, res, next) {
  if (err.code === '22P02') {
    // invalid input syntax - i.e. input value has incorrect type
    res.status(400).send({
      message:
        'Type of the provided value does not match the type expected in the related database field',
    });
  } else if (err.code === '23503') {
    // Primary Key ID referenced during insert/update does not exist
    res.status(404).send({ message: `ID does not exist` });
  } else {
    next(err);
  }
}

module.exports = handlePSQL400s;
