// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      //parent referencing
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// one user can only post one review on tour
// Duplicate reviews occur when a review with the same userId and tourId exists.
//reviewSchema ka  tour + user will unique together
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //compound index =>1 review pr tour and user 1hi ho skta h

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });
  //populating user
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // In the context of a static method, #this refers to the model itself, not an instance of a document.
  const stats = await this.aggregate([
    //ek tour ke sare reviews ko select krke unke upr  aggregation lga rhe h
    // First stage: Match reviews that belong to the specified tour
    { $match: { tour: tourId } },
    // Second stage: Group the matched reviews by the tour ID
    {
      $group: {
        _id: '$tour', // Grouping key; here, we group by the 'tour' field
        nRating: { $sum: 1 }, // Count the number of reviews (ratings)
        avgRating: { $avg: '$rating' } // Calculate the average rating from the 'rating' field
      }
    }
  ]);

  // Update the Tour model with new ratings data
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating, //update ratingsQuantity this field in tour
      ratingsAverage: stats[0].avgRating
    });
  } else {
    // Set to defaults if no reviews are present
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0, //update ratingsQuantity this field in tour
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // 'this' refers to the current review document that has just been saved
  // Call the static method calcAverageRatings on the model (this.constructor)
  // to calculate the average ratings for the tour associated with this review
  this.constructor.calcAverageRatings(this.tour); //this.tour, which is the tour ID associated with the current review.
});

// findByIdAndUpdate=findOneAnd//this=>query not to document
// findByIdAndDelete=findOneAnd

// (findByIdAndUpdate findByIdAndDelete) pr bhi ratingsAverage,ratingsQuantity ko accordingly change krne k lye

// this  Pre-Middleware: Captures the current review before it's updated or deleted.
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // Execute the query to get the current review document
  this.r = await this.findOne();
  next();
});

// this Post-Middleware: Uses the captured review to recalculate the average ratings.
reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne does not work here because query has already executed
  //Static Method: Aggregates ratings and updates the associated tour.
  this.r = await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
