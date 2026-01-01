const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

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

  const [lat, lng] = latlng.split(",").map(Number);

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
