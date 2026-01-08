const express = require("express");

const bookingController = require("./../controllers/bookingController");
const authController = require("./../controllers/authController");

const router = express.Router();

// ROUTE FOR GETTING STRIPE CHECKOUT SESSION
router.get(
  "/checkout-session/:tourId",
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
