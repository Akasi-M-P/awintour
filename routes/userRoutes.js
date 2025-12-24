// CORE MODULES
const express = require("express");

// CUSTOM MODULES
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// USER ROUTES
// USER ROUTE CREATED TO USE EXPRESS ROUTER
const router = express.Router();

// SIGNING UP A NEW USER
router.post("/signup", authController.signup);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
