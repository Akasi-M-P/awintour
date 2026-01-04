const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

// PUG ROUTES | SERVERSIDE RENDERING

router.use(authController.isLoggedIn);

// ROUTE FOR THE OVERVIEW PAGE
router.get("/", viewController.getOverview);

// ROUTE FOR A TOUR PAGE
router.get("/tour/:slug", authController.protect, viewController.getTour);

// ROUTE FOR LOGGING USER INTO THE APP
router.get("/login", viewController.getLoginForm);

module.exports = router;
