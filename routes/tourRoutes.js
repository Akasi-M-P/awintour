// CORE MODULES
const express = require("express");

// CUSTOM MODULES
const tourController = require("../controllers/tourController");

const router = express.Router();

router.param("id", tourController.checkID);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBodyMiddleware, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
