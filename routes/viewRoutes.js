const express = require("express");
const viewController = require("../controllers/viewController");

const router = express.Router();

// PUG ROUTES | CLIENTSIDE RENDERING

// ROUTE FOR THE OVERVIEW PAGE
router.get("/", viewController.getOverview);

// ROUTE FOR A TOUR PAGE
router.get("/tour/:slug", viewController.getTour);

module.exports = router;
