// CORE MODULES
const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// CUSTOM MODULES
const tourRoute = require("./routes/tourRoutes");
const userRoute = require("./routes/userRoutes");

// REGULAR MODULES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

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
