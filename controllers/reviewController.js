const Review = require('../models/reviewModel');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory'); //importing factory module

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   //if params contains tourId then filter value(tourId)  is taken from params (we get all review about a single tour  otherwise we get all the reviews)
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   if (!reviews) {
//     next(AppError('reviews not found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });
exports.getAllReviews = factory.getAll(Review);
//middleware
exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; //taking out user out of params
  if (!req.body.user) req.body.user = req.user.id; //getting id of logged in user(user comes on req body from protect routed)
  next();
};
// exports.createReview = catchAsync(async (req, res, next) => {
//   //allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId; //taking out user out of params
//   if (!req.body.user) req.body.user = req.user.id; //getting id of logged in user(user comes on req body from protect routed)

//   const newReview = await Review.create(req.body);

//   if (!newReview) {
//     next(AppError('reviews not created', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: { newReview }
//   });
// });
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
