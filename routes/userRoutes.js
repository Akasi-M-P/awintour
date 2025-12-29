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

// LOGGING IN USER
router.post("/login", authController.login);

// WHEN A USER FORGETS PASSWORD AND WANTS TO RESET IT
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// WHEN A USER IS LOGGED IN AND WANTS TO UPDATE THEIR PASSWORD
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

//WHEN A USER IS LOGGED IN WANTS TO UPDATE THEIR DATA AND NOT PASSWORD
router.patch("/updateMe", authController.protect, userController.updateMe);

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
