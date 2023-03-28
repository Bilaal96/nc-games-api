const db = require('../db/connection');

exports.selectReviewById = (reviewId) => {
  const selectReviewByIdQuery = `
    SELECT * FROM reviews
    WHERE review_id = $1;
  `;

  return db.query(selectReviewByIdQuery, [reviewId]).then((result) => {
    // if review was not found, return 404 error
    if (!result.rows.length) {
      return Promise.reject({
        status: 404,
        message: 'The requested review does not exist',
      });
    }

    // Return review
    return result.rows[0];
  });
};
