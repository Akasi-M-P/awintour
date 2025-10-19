// CORE MODULES
const express = require("express");
const morgan = require("morgan");

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
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
