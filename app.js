// CORE MODULES
const fs = require("fs");
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
app.use(express.static(`${__dirname}/public`));

// TOUR ROUTER USED
app.use("/api/v1/tours", tourRoute);

// USER ROUTER USED
app.use("/api/v1/users", userRoute);

module.exports = app;
