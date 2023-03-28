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

exports.selectReviews = () => {
  /**
   * COUNT() returns value as a bigint, which is then parsed as a string
   * CAST() or the type-cast operator (::) allow us to convert from one type to another
   * CAST(COUNT(*) AS INT) or COUNT(*)::INT - cast string to integer
   
   * NOTE: descending order on a date lists most recent date first
   */
  const selectReviewsQuery = `
    SELECT reviews.*, CAST(COUNT(comment_id) AS INT) AS comment_count
    FROM reviews
    LEFT OUTER JOIN comments ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.created_at DESC;
  `;

  return db.query(selectReviewsQuery).then((result) => result.rows);
};
