const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //1.get tour data from tour collection
  const tours = await Tour.find();
  //2.build template
  //3.render that template using tour data
  res.status(200).render('overview', { tours }); //passing tour data to template as object
});
exports.getTour = async (req, res, next) => {
  // 1)get the data for requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  // console.log(tour.reviews);

  //2) build template
  //3) render data using template
  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Login into your account' });
};
