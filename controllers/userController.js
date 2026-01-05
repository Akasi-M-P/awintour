const multer = require("multer");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

// UPLOADING FILES USING MULTER MIDDDLEWARE
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image. Please upload only images.", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single("photo");

// THIS FUNCTION FILTERS FIELD NAMES IN THE UPDATEME ROUTE
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// USERS ROUTE HANDLERS

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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

  // THIS ADDS THE PHOTO PROPERTY TO THE OBJECT BODY TO BE FILTERED
  if (req.file) filteredBody.photo = req.file.filename;

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

// GET ALL USERS
exports.getAllUsers = factory.getAll(User);

// GET SINGLE USER BASE ON USER ID
exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

// DO NOT USE TO UPDATE PASSWORDS
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
