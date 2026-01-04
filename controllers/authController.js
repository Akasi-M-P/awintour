const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const sendEmail = require("../utils/email");

//GENERATES UNIQUE TOKEN FOR USER AND DETERMINES WHEN TOKEN EXPIRES
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// USER DETAILS ARE VALID, SEND TOKEN TO CLIENT FUNCTION
const createSendToken = (user, statusCode, res) => {
  //GENERATES UNIQUE TOKEN FOR USER
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // REMOVES PASSWORD FROM OUTPUT
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
      new AppError("The user belonging to this token no longer exist.", 401)
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

// ONLY FOR RENDERED PAGES, NO ERRORS
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // VERIFY TOKEN
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // CHECK IF USER STILL EXIST
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next();
    }

    // CHECK IF USER CHANGED PASSSWORD AFTER THE TOKEN WAS ISSUED
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // THERE IS A LOGGED IN USER
    res.locals.user = currentUser;
    return next();
  }
  next();
});

exports.restrictTo = (...roles) => {
  // ROLES ["admin", "lead-guide"] default = "user"
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // CHECK IF USER EMAIL EXIST
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Email address does not exist.", 404));
  }

  // GENERATE A RANDOM TOKEN FOR USER IF THE EMAIL EXIST
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // SEND RESET PASSWORD LINK TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `We received a request to reset the password for your account.\n Please click the link below to reset your password. 
    This link will expire in 10 minutes for security reasons.\n${resetURL}\nIf you did not request a password reset, please ignore this email—your account will remain secure.
    \nIf you continue to have trouble accessing your account, feel free to contact our support team.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token(valid for for 10mins)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(error);

    return next(
      new AppError(
        "There was an errror sending the email. Try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // GET USER BASED ON URL TOKEN, ENCRYPT IT WITH CRYPTO AND COMPARE WITH THE ENCRYPTED TOKEN IN THE DATABASE
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // IF USER EXIST AND THE PASSWORD RESET TOKEN HAS NOT EXPIRED, SET THE NEW PASSWORD
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // IF USER DETAILS ARE VALID, SEND TOKEN TO CLIENT
  createSendToken(user, 200, res);
});

// THIS ALLOWS LOGGED IN USERS TO CHANGE THEIR PASSWORD IF THEY WANT
exports.updatePassword = catchAsync(async (req, res, next) => {
  // GET USER FROM THE DATABASE COLLECTION
  const user = await User.findById(req.user.id).select("+password"); //USER.findByIdAndUpdate WILL NOT WORK AS INTENDED BECAUSE MONGO DOES NOT KEEP CURRENT DATA IN MEMORY

  // CHECK IF POSTED CURRENT PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Password entered is incorrect", 401));
  }

  // IF CORRECT, UPDATE THE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // LOG USER IN AND SEND JWT
  createSendToken(user, 200, res);
});
