const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");

//GENERATES UNIQUE TOKEN FOR USER AND DETERMINES WHEN TOKEN EXPIRES
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//SIGNS UP NEW USER WITH VALID DETAILS
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //GENERATES UNIQUE TOKEN FOR USER
  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

//LOGS IN USER WITH VALID DETAILS
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // CHECK IF USER EXIST AND PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // IF USER DETAILS ARE VALID, SEND TOKEN TO CLIENT
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

// THIS MIDDLEWARE PROTECTS GET ALL TOURS ROUTE
exports.protect = catchAsync(async (req, res, next) => {
  // GETTING TOKEN AND CHECKING IF IT'S THERE
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = await req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // VERIFY TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // CHECK IF USER STILL EXIST
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token nolonger exist.", 401)
    );
  }

  // CHECK IF USER CHANGED PASSSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // THEN GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
