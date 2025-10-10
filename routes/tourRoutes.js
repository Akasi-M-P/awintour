// CORE MODULES
const express = require("express");

// CUSTOM MODULES
const tourController = require("../controllers/tourController");

const router = express.Router();

// ALIAS ROUTE
router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

// GET TOUR STATS
router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
