const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true, // Trims the given string (begin & end)
      maxlength: [40, 'A tour name must have less than 40 characters'],
      minlength: [10, 'A tour name must have more than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contains characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4,
      min: [1, 'Rating must be between 1 to 5'],
      max: [5, 'Rating must be between 1 to 5'],
      set: (val) => Math.round(val * 10) / 10, // (4.66666) -> 46.6666 -> 47 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // (this points to current doc) only when creating, not updating
          return val < this.price;
        },
        message: `Discount price should be below the regular price`,
      },
    },
    summary: {
      type: String,
      trim: true, // Trims the given string (begin & end)
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // To hide from the output
    },
    startDates: [Date], // Automatically parsed into a date format (input like 2024-03-21)
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: 'String',
        description: 'String',
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); // sorting ascendingly, to make find faster
tourSchema.index({ price: 1, ratingsAverage: -1 }); // sorting ascendingly - descendingly
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before the .save() command and .create(), !!!! but not on .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

// EMBEDDING GUIDES
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// tourSchema.pre('save', (next) => {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // Any string that starts with find
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // Any string that starts with find
  console.log(`${Date.now() - this.start} ms`);
  // console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
