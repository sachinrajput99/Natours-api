const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory'); //importing factory module
//middle ware function adds data into the req(so these are available in the router)
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5'; //limits the no of item
  req.query.sort = '-ratingsAverage,price'; //descending price
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'; //fields
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // Execute the query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;

//   // Send response
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: { tours }
//   });
// });
exports.getAllTours = factory.getAll(Tour);

// exports.getTour = catchAsync(async (req, res, next) => {
//   ////////////////////////////////Cast Error////////////////
//   // Check if the ID is a not valid ObjectId
//   const isValidObjectId = id => /^[0-9a-f]{24}$/.test(id);

//   if (!isValidObjectId(req.params.id)) {
//     // return res.status(400).json({ message: 'Invalid ID format' });
//     return next(new AppError('Invalid ID format', 400));
//   }
//   //////////////////////////////////////////////////////////

//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   // Check if the tour is null
//   if (!tour) {
//     ///this block is not triggering
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

//async function
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   console.log(newTour);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });
exports.createTour = factory.createOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     //returns new updated document
//     runValidators: true
//   });

//   // Check if the tour is null
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

//implementing above route using factory function
exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id, req.body);

//   // Check if the tour is null
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success'
//   });
// });

//implementing above route using factory function
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  console.log('getTourStats');

  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id:{null},
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $avg: '$ratingsQuantity' },
        avgRating: { $avg: '$price' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { avgPrice: 1 } },
    { $match: { _id: { $ne: 'EASY' } } }
  ]);
  res.status(200).json({
    status: 'success',
    result: stats.length,
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021(converting to number)

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, //make a new document for every element in array
    {
      $match: {
        //filtering happens here
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    }, //filters
    {
      $group: {
        //make group of these fields  for api
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    { $addFields: { month: '$_id' } }, //ads the new field
    { $project: { _id: 0 } }, //removes this field from stat
    { $sort: { numTourStars: -1 } }, //descending order
    { $limit: 12 } //limits the number of document
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});

//  tours-within/233/center/-40,45/unit/mi
// '/tours-within/:distance/center/:latlng/unit/:unit',
// '/tours-within/:distance/center/32.471317, 77.031731/unit/:unit',
//{{URL}}api/v1/tours/tours-within/233/center/32.471317, 77.031731/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); //'32.471317,77.031731'=>[32.471317,77.031731]

  if (!lat || !lng) {
    return next(
      AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  // Earth radius in miles or kilometers
  const radiusInRadians = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      //  $geoWithin is a MongoDB geo-spatial operator that finds documents within a specified geometry.
      //$centerSphere operator is used to define a spherical area for the query. [[longitude, latitude], radiusInRadians]
      $geoWithin: { $centerSphere: [[lng, lat], radiusInRadians] }
    }
  });
  res
    .status(200)
    .json({ status: 'success', result: tours.length, data: tours });
});

//GET /distances?lat=34.0522&lng=-118.2437&unit=miles

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'point', coordinates: [lng * 1, lat * 1] }, //converting strings to number
        distanceField: 'distance',
        distanceMultiplier: multiplier //distance in km
      }
    },
    { $project: { name: 1, distance: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    result: distance.length,
    data: { data: distance }
  });
});
