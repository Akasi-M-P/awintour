// CORE MODULES
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xxs = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
// CUSTOM MODULES
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const bookingController = require("./controllers/bookingController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// CORS — restrict to configured origin in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV !== "production"),
  credentials: true,
};
app.use(cors(corsOptions));
app.options("/{*any}", cors(corsOptions));

// STRIPE WEBHOOK — must receive raw body, registered before JSON parser
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

// STATIC FILES URL DIRECTORY
app.use(express.static(path.join(__dirname, "public")));

// SET SECURITY HTTP HEADERS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://api.mapbox.com",
          "https://cdn.jsdelivr.net",
          "https://js.stripe.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://api.mapbox.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://api.mapbox.com"],
        connectSrc: [
          "'self'",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://api.stripe.com",
        ],
        workerSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https://js.stripe.com"],
      },
    },
  })
);

app.set("query parser", "extended");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP address, please try again in an hour",
});

app.use("/api", limiter);

// BODY PARSER
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Make req.query writable for mongoSanitize compatibility
app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
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

app.use(compression());

// ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("/{*any}", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
