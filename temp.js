const selectReviews = () => {
  const selectReviewsQuery = 'SELECT * FROM reviews;';
  const selectCommentsQuery = 'SELECT comment_id, review_id FROM comments';

  // rejects all if one fails, and returns rejected value
  return Promise.all([
    db.query(selectReviewsQuery),
    db.query(selectCommentsQuery),
  ])
    .then(([reviewsResult, commentsResult]) => {
      // ! EDGE CASES
      // ! may return with empty reviews or comments or both empty

      // [reviewsResult, commentsResult];
      const reviews = reviewsResult.rows;
      const comments = commentsResult.rows;

      console.log({ reviews, comments });

      // lookup comments.review_id within reviews & increment each time returned value is not undefined

      // nested loop -> loop reviews, count all comments with review_id, assign count as comments_count to return object
    })
    .catch((err) => {
      console.log(err);
    });

  /* return db.query(selectReviewsQuery).then((result) => result.rows)
  .then((reviews) => {
    console.log(reviews)
    return db.query();
  }); */
};
