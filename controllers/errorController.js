const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

/**
 * SEND DETAILED ERROR RESPONSE IN DEVELOPMENT MODE
 * SHOWS FULL ERROR INFORMATION FOR DEBUGGING
 */
const sendErrorDev = (err, req, res) => {
  // ===============================
  // API REQUESTS
  // ===============================
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // ===============================
  // RENDERED WEBSITE REQUESTS
  // ===============================
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: err.message,
  });
};

/**
 * SEND LIMITED ERROR RESPONSE IN PRODUCTION MODE
 * HIDES INTERNAL DETAILS FROM USERS
 */
const sendErrorProd = (err, req, res) => {
  // ===============================
  // API REQUESTS
  // ===============================
  if (req.originalUrl.startsWith("/api")) {
    // OPERATIONAL, TRUSTED ERROR → SEND MESSAGE TO CLIENT
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // PROGRAMMING OR UNKNOWN ERROR → LOG & SEND GENERIC MESSAGE
    console.error("ERROR 💥", err);

    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  // ===============================
  // RENDERED WEBSITE REQUESTS
  // ===============================

  // OPERATIONAL, TRUSTED ERROR → SHOW USER-FRIENDLY MESSAGE
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }

  // PROGRAMMING OR UNKNOWN ERROR → LOG & SHOW GENERIC MESSAGE
  console.error("ERROR 💥", err);

  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "JsonWebTokenExpired") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
