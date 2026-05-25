const fs = require("fs").promises;
const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/appError");
const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const { uploadToS3, s3Available } = require("../utils/s3");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image. Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  const tourId = req.params.id || `new-${Date.now()}`;

  if (req.files.imageCover) {
    req.body.imageCover = `tour-${tourId}-${Date.now()}-cover.jpeg`;
    const coverBuf = await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();
    if (s3Available()) {
      await uploadToS3(coverBuf, `img/tours/${req.body.imageCover}`);
    } else {
      await fs.writeFile(`public/img/tours/${req.body.imageCover}`, coverBuf);
    }
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
        const buf = await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toBuffer();
        if (s3Available()) {
          await uploadToS3(buf, `img/tours/${filename}`);
        } else {
          await fs.writeFile(`public/img/tours/${filename}`, buf);
        }
        req.body.images.push(filename);
      })
    );
  }

  next();
});

exports.adminCreateTour = catchAsync(async (req, res, next) => {
  const b = req.body;

  const startDates = [b.startDate1, b.startDate2, b.startDate3]
    .filter(Boolean)
    .map(d => new Date(d));

  const startLocation = {
    type: "Point",
    description: b.startLocationDescription,
    address: b.startLocationAddress || "",
    coordinates: [
      parseFloat(b.startLocationLng) || 0,
      parseFloat(b.startLocationLat) || 0,
    ],
  };

  const guides = b.guides
    ? Array.isArray(b.guides) ? b.guides : [b.guides]
    : [];

  const tourData = {
    name: b.name,
    duration: Number(b.duration),
    maxGroupSize: Number(b.maxGroupSize),
    difficulty: b.difficulty,
    price: Number(b.price),
    summary: b.summary,
    imageCover: b.imageCover,
    startDates,
    startLocation,
    guides,
  };
  if (b.priceDiscount) tourData.priceDiscount = Number(b.priceDiscount);
  if (b.description)   tourData.description   = b.description;
  if (b.images)        tourData.images        = b.images;

  const tour = await Tour.create(tourData);

  res.status(201).json({ status: "success", data: { tour } });
});

exports.adminUpdateTour = catchAsync(async (req, res, next) => {
  const b = req.body;
  const update = {};

  if (b.name)         update.name         = b.name;
  if (b.duration)     update.duration     = Number(b.duration);
  if (b.maxGroupSize) update.maxGroupSize = Number(b.maxGroupSize);
  if (b.difficulty)   update.difficulty   = b.difficulty;
  if (b.price)        update.price        = Number(b.price);
  if (b.summary)      update.summary      = b.summary;
  if (b.description !== undefined) update.description   = b.description;
  if (b.priceDiscount !== undefined && b.priceDiscount !== "")
                      update.priceDiscount = Number(b.priceDiscount);
  if (b.imageCover)   update.imageCover   = b.imageCover;
  if (b.images)       update.images       = b.images;

  const startDates = [b.startDate1, b.startDate2, b.startDate3]
    .filter(Boolean).map(d => new Date(d));
  if (startDates.length) update.startDates = startDates;

  if (b.startLocationLat || b.startLocationLng || b.startLocationDescription) {
    update.startLocation = {
      type: "Point",
      description: b.startLocationDescription || "",
      address:     b.startLocationAddress     || "",
      coordinates: [
        parseFloat(b.startLocationLng) || 0,
        parseFloat(b.startLocationLat) || 0,
      ],
    };
  }

  if (b.guides !== undefined) {
    update.guides = b.guides
      ? (Array.isArray(b.guides) ? b.guides : [b.guides])
      : [];
  }

  const tour = await Tour.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new AppError("No tour found with that ID", 404));

  res.status(200).json({ status: "success", data: { tour } });
});

exports.aliasTopTours = (req, res, next) => {
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  req.query.sort = "-ratingsAverage,price";
  req.query.limit = "5";
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: "reviews" });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
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

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
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
