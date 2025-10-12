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
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
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
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
