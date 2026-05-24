const express = require("express");

const bookingController = require("./../controllers/bookingController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

// Admin cannot go through Stripe checkout; they use the admin-book route instead
router.get(
  "/checkout-session/:tourId",
  authController.restrictTo("user", "guide", "lead-guide"),
  bookingController.getCheckoutSession
);

router.post(
  "/admin-book",
  authController.restrictTo("admin"),
  bookingController.adminCreateBooking
);

router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
