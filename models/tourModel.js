const mongoose = require("mongoose");
const slugify = require("slugify");

// THIS CREATES A TOUR MODEL USING MONGOOSE
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "Name must have equal or less than 40 characters"],
      minlength: [10, "Name must have equal or more than 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficulty",
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be equal or above 1"],
      max: [5, "Rating must be equal or less 5"],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // THIS VALIDATOR ONLY WORKS ON THE CURRENT DOC BEING CREATED
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) shouuld be below regular price",
      },
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have an image cover"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VIRTUAL IMPLEMENTATION
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// MONGOOSE DOC MIDDLEWARE: THE PRE MIDDLEWARE RUN BEFORE A DOC IS "SAVE()" OR "CREATE()" ONLY"
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", function (next) {
//   console.log("DOCUMENT BEING CREATED");
//   next();
// });

// // MONGOOSE DOC MIDDLEWARE: THE POST MIDDLEWARE RUN AFTER A DOC IS "SAVE()" OR "CREATE()" ONLY"
// tourSchema.post("save", function (next) {
//   console.log("DOCUMENT SAVED FROM THE POST MIDDLEWARE");
//   // next();
// });

// MONGOOSE QUERY MIDDLEWARE: ALLOWS DATA TO BE MANIPULATED BEFORE AND AFTER A QUERY IS MADE. E.G(FIND(),FINDONE(),FINDONEANDUPDATE()...ETC)"
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  // CALCULATE HOW LONG IT TAKES TO RECEIVE A RESPONSE FROM A QUERY
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // CALCULATE HOW LONG IT TAKES TO RECEIVE A RESPONSE FROM A QUERY
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// MONGOOSE AGGREGATE MIDDLEWARE: ALLOWS DATA TO BE MANIPULATED BEFORE AND AFTER AN AGGREGATE IS IMPLEMENTED.
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
