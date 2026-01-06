// CORE MODULES
const express = require("express");

// CUSTOM MODULES
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

// THIS IMPLIES THAT ANYTIME ITS SLASH TOUR ID SLASH REVIEWS, THEN THE TOUR ROUTE CAN USE THE REVIEWROUTER TO ACCESS THE REVIEWS OF THAT TOUR
router.use("/:tourId/reviews", reviewRouter);

// ALIAS ROUTE
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

// GET TOUR STATS
router.route("/tour-stats").get(tourController.getTourStats);

// GET MONTHLY PLAN
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );

// GETS TOURS WITHIN A CERTAIN DISTANCE
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

// GET DISTANCES OF TOURS FROM A POINT
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
