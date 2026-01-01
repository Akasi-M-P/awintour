const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

// THIS FUNCTION FILTERS FIELD NAMES IN THE UPDATEME ROUTE
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// USERS ROUTE HANDLERS
// GET ALL USERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// THIS ROUTE ALLOWS A LOGGED USER TO UPDATE THEIR DATA AND NOT PASSWORD
exports.updateMe = catchAsync(async (req, res, next) => {
  // CREATE ERROR IF USER TRIES TO UPDATE PASSWORD DATA
  if (req.body.password || req.body.passswordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }
  // FILTERED OUT UNWANTED FIELD NAMES TAHT ARE NOT ALLOWED TO BE UPDATED
  const filteredBody = filterObj(req.body, "name", "email");

  //UPDATE USER DOCUMENT IN THE DATABASE
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// THIS ROUTE ALLOWS A LOGGED IN USER TO DELETE THEIR ACCOUNT(DEACTIVATE ACCOUNT === FALSE)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Server not yet defined",
  });
};

exports.createUser = factory.createOne(User);

// DO NOT USE TO UPDATE PASSWORDS
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
