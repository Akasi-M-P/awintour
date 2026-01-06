const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

// UPLOADING FILES USING MULTER MIDDDLEWARE IF PHOTO RESIZING IS REQUIRED
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image. Please upload only images.", 400), false);
  }
};

//THIS UPLOADS TOUR IMAGES
exports.uploadTourImages = this.uploadTourImages.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// RESIZES TOUR IMAGES
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // RESIZING OF COVER IMAGE
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // RESIZING OF OTHER IMAGES
  await Promise.all(
    req.files.images.forEach(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// THIS ROUTES GETS THE TOP 5 CHEAPEST TOURS
exports.aliasTopTours = (req, res, next) => {
  console.log("Alias middleware triggered");
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  req.query.sort = "-ratingsAverage,price";
  req.query.limit = "5";
  console.log("Alias middleware triggered");
  console.log("Modified query:", req.query);
  next();
};

// GET ALL TOURS
exports.getAllTours = factory.getAll(Tour);

// // GET A TOUR
exports.getTour = factory.getOne(Tour, { path: "reviews" });

// // GET A TOUR
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate("reviews");

//   // WHEN THERE IS NO TOUR FOUND WITH AN ID
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   // SEND TOUR TO CLIENT
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });

// CREATE A NEW TOUR
exports.createTour = factory.createOne(Tour);

// UPDATE TOUR
exports.updateTour = factory.updateOne(Tour);

// UPDATE TOUR
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   // WHEN THERE IS NO TOUR FOUND WITH AN ID
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
// });

// DELETE TOUR
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   // WHEN THERE IS NO TOUR FOUND WITH AN ID
//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
// });

// DELETE TOUR USING FACTORY HANDLER INSTEAD OF ABOVE
exports.deleteTour = factory.deleteOne(Tour);

// GET TOUR STATISTICS
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// GET MONTHLY STATISTICS
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

// GET TOURS WITHIN A CERTAIN DISTANCE
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// GET DISTANCES OF TOURS FROM A POINT OF LOCATION
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
