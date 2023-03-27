const db = require('../db/connection');

exports.selectReviewById = (reviewId) => {
  /** validate reviewId
   * Must be an integer when parsed, otherwise return an error
   * parseFloat returns NaN for non-numeric values
   * isInteger evaluates with false when passed NaN or a float */
  if (!Number.isInteger(parseFloat(reviewId))) {
    return Promise.reject({
      status: 400,
      message: 'Received invalid review ID',
    });
  }

  const selectReviewByIdQuery = `
    SELECT * FROM reviews
    WHERE review_id = $1;
  `;

  return db.query(selectReviewByIdQuery, [reviewId]).then((result) => {
    // if review was not found, return 404 error
    if (!result.rows.length) {
      console.log('404', result);
      return Promise.reject({
        status: 404,
        message: 'The requested review does not exist',
      });
    }

    // Return review
    return result.rows[0];
  });
};
