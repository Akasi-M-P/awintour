const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  tour.formattedDate = tour.startDates[0].toISOString().split("T")[0];

  // WHEN THERE IS NO DOCUMENT FOUND WITH AN ID
  if (!tour) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  // const { email, password } = req.body;

  // // CHECK IF EMAIL AND PASSWORD EXIST
  // if (!email || !password) {
  //   return next(new AppError("Please provide email and password", 400));
  // }

  // // CHECK IF USER EXIST AND PASSWORD IS CORRECT
  // const user = await User.findOne({ email }).select("+password");

  // if (!user || !(await user.correctPassword(password, user.password))) {
  //   return next(new AppError("Incorrect email or password", 401));
  // }

  res.status(200).render("login", {
    title: "Log in into your acccount",
  });
};
