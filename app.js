// CORE MODULES
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xxs = require("xss-clean");
const hpp = require("hpp");

// CUSTOM MODULES
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const tourRoute = require("./routes/tourRoutes");
const userRoute = require("./routes/userRoutes");

const app = express();

// GLOBAL MODULES

// SET SECURITY HTTP HEADERS
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requets from this IP address, please try again in an hour",
});

app.use("/api", limiter);

// BODY PARSER, READS DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: "10kb" }));

// // DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
// app.use(mongoSanitize());

app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query }, // Create a shallow copy
    writable: true, // Make it writable
    configurable: true,
    enumerable: true,
  });
  next();
});
// Place your sanitization middleware after this
app.use(mongoSanitize());

// DATA SANITIZATIO AGAINST XXS
app.use(xxs());

// PREVENTS PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "difficulty",
      "ratingsAverage",
      "price",
      "ratingQuantity",
    ],
  })
);

// STATIC FILES URL DIRECTORY
app.use(express.static(`${__dirname}/public`));

// TOUR ROUTER USED
app.use("/api/v1/tours", tourRoute);

// USER ROUTER USED
app.use("/api/v1/users", userRoute);

// UNHANDLED ROUTES
app.all("/{*any}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
