const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// 1.Factory Function: A function that returns another function, which can encapsulate behavior and reduce code duplication.
// 1.Closures model is accessed in inner function due to closure
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, req.body);

    // Check if the tour is null
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success'
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //returns new updated document
      runValidators: true
    });

    // Check if the tour is null
    if (!doc) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    //     console.log(newTour);

    res.status(201).json({
      status: 'success',
      data: {
        tour: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    ////////////////////////////////Cast Error////////////////
    // Check if the ID is a not valid ObjectId
    const isValidObjectId = id => /^[0-9a-f]{24}$/.test(id);

    if (!isValidObjectId(req.params.id)) {
      // return res.status(400).json({ message: 'Invalid ID format' });
      return next(new AppError('Invalid ID format', 400));
    }
    //////////////////////////////////////////////////////////

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // Check if the tour is null
    if (!doc) {
      ///this block is not triggering
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //to allow for nested GET review on the tour (hack)
    let filter = {};
    //if params contains tourId then filter value(tourId)  is taken from params (we get all review about a single tour  otherwise we get all the reviews)
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Execute the query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain();//167. Improving Read Performance with Indexes
    const doc = await features.query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { doc }
    });
  });
