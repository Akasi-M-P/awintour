const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res) => {
  const filter = {};
  const { search, difficulty } = req.query;
  const priceMax = req.query.price && req.query.price.lte;

  if (search) filter.name = { $regex: search, $options: "i" };
  if (difficulty) filter.difficulty = difficulty;
  if (priceMax) filter.price = { $lte: Number(priceMax) };

  const tours = await Tour.find(filter);
  res.status(200).render("overview", { title: "All Tours", tours, query: req.query });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) return next(new AppError("No tour found with that name", 404));

  const bookingsCount = await Booking.countDocuments({ tour: tour._id });
  const seatsLeft = Math.max(0, tour.maxGroupSize - bookingsCount);

  let hasBooked = false;
  let userReview = null;
  if (req.user) {
    const booking = await Booking.findOne({ tour: tour._id, user: req.user._id });
    hasBooked = !!booking;
    if (hasBooked) userReview = tour.reviews.find(r => r.user._id.equals(req.user._id)) || null;
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
    seatsLeft,
    hasBooked,
    userReview,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", { title: "Log in to your account" });
};

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render("forgotPassword", { title: "Forgot password" });
};

exports.getResetPasswordForm = (req, res) => {
  res.status(200).render("resetPassword", { title: "Reset password", token: req.params.token });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.getMyTours = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map(b => b.tour._id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  const bookingDetails = bookings.map(b => ({
    _id: b._id,
    price: b.price,
    createdAt: b.createdAt,
    tour: tours.find(t => t._id.equals(b.tour._id)),
  })).filter(b => b.tour);

  res.status(200).render("myTours", { title: "My Bookings", bookingDetails });
});

exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate({ path: "tour", select: "name slug" });
  res.status(200).render("myReviews", { title: "My Reviews", reviews });
});

exports.getWishlist = catchAsync(async (req, res) => {
  let ids = [];
  try {
    const raw = req.cookies["natours_wishlist"];
    if (raw) ids = JSON.parse(decodeURIComponent(raw)).filter(Boolean);
  } catch { /* malformed cookie — treat as empty */ }

  const tours = ids.length ? await Tour.find({ _id: { $in: ids } }) : [];
  res.status(200).render("wishlist", { title: "My Wishlist", tours });
});

exports.getManageTours = catchAsync(async (req, res) => {
  const tours = await Tour.find().setOptions({ includeSecret: true }).select("name slug price difficulty ratingsAverage imageCover secretTour");
  res.status(200).render("manageTours", { title: "Manage Tours", tours });
});

exports.getCreateTourForm = catchAsync(async (req, res) => {
  const guides = await User.find({ role: { $in: ["guide", "lead-guide"] } }).select("name role");
  res.status(200).render("createTour", { title: "Create New Tour", guides });
});

exports.getManageUsers = catchAsync(async (req, res) => {
  const users = await User.find().setOptions({ includeInactive: true }).select("name email role photo active");
  res.status(200).render("manageUsers", { title: "Manage Users", users });
});

exports.getManageReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find().populate({ path: "tour", select: "name" });
  res.status(200).render("manageReviews", { title: "Manage Reviews", reviews });
});

exports.getManageBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find();
  res.status(200).render("manageBookings", { title: "Manage Bookings", bookings });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true }
  );
  res.status(200).render("account", { title: "Your Account", user: updatedUser });
});
