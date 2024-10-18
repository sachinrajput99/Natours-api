const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// // POST /tours/:tourId/reviews
// const router = express.Router();
const router = express.Router({ mergeParams: true }); //redirect the route here from tours👉router.use('/:tourId/reviews', reviewRouter); => access :tourId, id parameter,

//all route below this route are protected
router.use(authController.protect);
// GET /tours/:tourId/reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
//deleting reviews
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
