const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./usersModel');
// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'A name is required'],
//     unique: true
//   },

//   rating: {
//     type: Number,
//     default: 4.5
//   },

//   price: {
//     type: Number,
//     required: [true, 'A price is required'] // corrected message
//   }
// });

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      // A setter function that is called whenever a new value is assigned to this field
      set: value => Math.round(value * 10) / 10 //4.6666=>46.6666 , 4.6
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        //custom validator
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //embedding object
      //geoJson
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number], // "coordinates": [-73.935242, 40.730610]
      address: String,
      description: String
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number], // "coordinates": [-73.935242, 40.730610]
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array
    //referencing tour guide
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//DOCUMENT MIDDLEWARE //runs before .save() and .create() but not before insertMany()
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//indexing 167. Improving Read Performance with Indexes
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound indexing
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// tourSchema.pre('save', function(next) {
//   console.log('this is second mongoose middleware');

//   next();
// });

////runs after saving the document
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);

//   next();
// });

//embedding tour guide

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//QUERY MIDDLEWARE

// this query middleware executes before query executes
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }); //this refers to the query
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

//this  query middleware  executes after query executes
tourSchema.post(/^post/, function(docs, next) {
  console.log(docs);

  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// // AGGREGATION MIDDLEWARE

//this query aggregate run before any other  aggregation in pipe line
// tourSchema.pre('aggregate', function(next) {
//   // this.pipeline()//array of object in which we have all pipeline query
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //adds this query before all queries in aggregation pipe line
//   // console.log(this.pipeline()); //array of aggregate query

//   next();
// });

//this query aggregate run before any other  aggregation in pipe line
// making $geoNear first in the pipeline
tourSchema.pre('aggregate', function(next) {
  // Get the current aggregation pipeline
  const pipeline = this.pipeline();

  // Check if there is a $geoNear stage in the pipeline
  const hasGeoNear = pipeline.some(el => el.$geoNear !== undefined);

  if (hasGeoNear) {
    // If $geoNear exists, add the $match stage right after it
    const geoNearIndex = pipeline.findIndex(el => el.$geoNear !== undefined);
    pipeline.splice(geoNearIndex + 1, 0, {
      $match: { secretTour: { $ne: true } }
    });
  } else {
    // If $geoNear does not exist, add the $match stage at the beginning(beginning of the array of pipeline)
    pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  }

  // Log the modified pipeline for debugging
  console.log(this.pipeline());

  // Move to the next middleware function
  next();
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour'
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
