const db = require('../db/connection');
const format = require('pg-format');

exports.selectReviewById = (reviewId) => {
  const selectReviewByIdQuery = `
    SELECT reviews.*, CAST(COUNT(comment_id) AS INT) AS comment_count 
    FROM reviews
    LEFT OUTER JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id
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

exports.selectReviews = (reqQuery) => {
  const { category, sort_by, order } = reqQuery;
  const sqlQueryParams = [];

  // validate sort_by
  const validSortCriteria = [
    'title', // game title
    'category',
    'votes', // review votes
    'designer', // game designer
    'owner', // author of review
    'created_at',
  ];

  if (sort_by && !validSortCriteria.includes(sort_by)) {
    return Promise.reject({ status: 400, message: 'Invalid sort_by query' });
  }

  // validate order
  if (order && !['asc', 'desc'].includes(order)) {
    return Promise.reject({ status: 400, message: 'Invalid order query' });
  }

  /**
   * COUNT() returns value as a bigint, which is then parsed as a string
   * To convert from one type to another use: CAST(COUNT(*) AS <TYPE>) or COUNT(*)::<TYPE>
   * Cast string to integer: CAST(COUNT(*) AS INT) or COUNT(*)::INT
   * NOTE: descending order on a date lists most recent date first
   */
  let selectReviewsQuery = `
    SELECT reviews.*, CAST(COUNT(comment_id) AS INT) AS comment_count
    FROM reviews
    LEFT OUTER JOIN comments ON reviews.review_id = comments.review_id
  `;

  // Only return reviews in category if specified
  if (category) {
    sqlQueryParams.push(category);
    selectReviewsQuery += ' WHERE reviews.category = $1\n';
  }

  // Required with aggregate function COUNT
  selectReviewsQuery += ' GROUP BY reviews.review_id\n';

  if (sort_by) {
    // user-specified sort - defaults to ascending order, unless specified otherwise by user
    selectReviewsQuery += ` ORDER BY reviews.${sort_by} ${order || 'ASC'}\n`;
  } else {
    // default sort: by created_at (in descending order, unless specified otherwise by user)
    selectReviewsQuery += ` ORDER BY reviews.created_at ${order || 'DESC'}\n`;
  }

  return db
    .query(selectReviewsQuery, sqlQueryParams)
    .then((result) => result.rows);
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

// NOTE: When the requested ID does not exist for an insert/update, the error is handled in handle-psql-400s.js
// This saves us from having to make an extra DB request with checkResourceExists
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

exports.updateVotesByReviewId = (incrementVotes, reviewId) => {
  if (incrementVotes === undefined) {
    return Promise.reject({
      status: 400,
      message: 'Value to increment votes by was not provided',
    });
  }

  const updateVotesByReviewIdQuery = `
    UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *;
  `;

  return db
    .query(updateVotesByReviewIdQuery, [incrementVotes, reviewId])
    .then((result) => result.rows[0]);
};

exports.deleteComment = (commentId) => {
  const deleteCommentByCommentIdQuery = `
    DELETE FROM comments
    WHERE comment_id = $1;
  `;

  return db.query(deleteCommentByCommentIdQuery, [commentId]);
};

// If this check returns a rejected promise it will be caught by closest catch-block in the promise chain
// Otherwise code execution continues as expected
exports.checkResourceExists = (table, column, value) => {
  const selectQuery = format('SELECT * FROM %I WHERE %I = $1;', table, column);

  return db.query(selectQuery, [value]).then((result) => {
    if (!result.rowCount) {
      return Promise.reject({ status: 404, message: 'Resource not found' });
    }
  });
};
