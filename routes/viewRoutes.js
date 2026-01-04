const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

// PUG ROUTES | SERVERSIDE RENDERING

// ROUTE FOR THE OVERVIEW PAGE
router.get("/", authController.isLoggedIn, viewController.getOverview);

// ROUTE FOR A TOUR PAGE
router.get("/tour/:slug", authController.isLoggedIn, viewController.getTour);

// ROUTE FOR LOGGING USER INTO THE APP
router.get("/login", authController.isLoggedIn, viewController.getLoginForm);

// ROUTE FOR OPENING USER ACCOUNT/PROFILE
router.get("/me", authController.protect, viewController.getAccount);

// UPDATING USER DATA
router.post(
  "/submit-user-data",
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
