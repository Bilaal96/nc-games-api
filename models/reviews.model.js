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

exports.selectCommentsByReviewId = (reviewId) => {
  const selectCommentsByReviewIdQuery = `
    SELECT * FROM comments
    WHERE review_id = $1
    ORDER BY created_at DESC;
  `;

  return db
    .query(selectCommentsByReviewIdQuery, [reviewId])
    .then((result) => result.rows);
};

// If this check returns a rejected promise it will be caught by closest catch-block in the promise chain
// Otherwise code execution continues as expected
exports.checkReviewExists = (reviewId) => {
  return db
    .query('SELECT * FROM reviews WHERE review_id = $1', [reviewId])
    .then((result) => {
      if (!result.rowCount)
        return Promise.reject({
          status: 404,
          message:
            'The review (for which comments were requested) does not exist',
        });
    });
};

// NOTE: When the requested ID does not exist for an insert/update, the error is handled in handle-psql-400s.js
// This saves us from having to make an extra DB request with checkReviewExists
exports.insertCommentByReviewId = (newComment, reviewId) => {
  const { username, body } = newComment;

  // check if newComment contains only the appropriate keys
  if (!username || !body || Object.keys(newComment).length > 2) {
    return Promise.reject({
      status: 400,
      message:
        'Invalid comment received - must only include the keys: username & body',
    });
  }

  // newComment is valid, attempt to insert in comments table
  const values = [username, body, reviewId];

  const insertCommentByReviewIdQuery = `
    INSERT INTO comments
      (author, body, review_id)
    VALUES
      ($1, $2, $3)
    RETURNING *;
  `;

  return db
    .query(insertCommentByReviewIdQuery, values)
    .then((result) => result.rows[0]);
};

exports.updateVotesByReviewId = (incrementVote, reviewId) => {
  const updateVotesByReviewIdQuery = `
    UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *;
  `;

  return db
    .query(updateVotesByReviewIdQuery, [incrementVote, reviewId])
    .then((result) => result.rows[0]);
};
