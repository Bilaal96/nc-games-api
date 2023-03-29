const {
  selectReviewById,
  selectReviews,
  selectCommentsByReviewId,
  checkReviewExists,
  insertCommentByReviewId,
  updateVotesByReviewId,
} = require('../models/reviews.model');

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;

  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviews = (req, res, next) => {
  selectReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;

  selectCommentsByReviewId(review_id)
    .then((comments) => {
      if (!comments.length) {
        /**
         * reject with error if review does not exist - because comments cannot exist without a review
         * otherwise, review does not have comments, return empty comments array
         */
        return checkReviewExists(review_id).then(() => comments);
      } else {
        // return array of comment objects
        return comments;
      }
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByReviewId = (req, res, next) => {
  const newComment = req.body;
  const { review_id } = req.params;

  insertCommentByReviewId(newComment, review_id)
    .then((createdComment) => {
      res.status(201).send({ createdComment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotesByReviewId = (req, res, next) => {
  const { inc_votes } = req.body;
  const { review_id } = req.params;

  checkReviewExists(review_id)
    .then(() => updateVotesByReviewId(inc_votes, review_id))
    .then((updatedReview) => {
      res.status(200).send({ updatedReview });
    })
    .catch((err) => {
      next(err);
    });
};
