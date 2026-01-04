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

// LOGGING OUT USER
router.get("/logout", authController.logout);

// WHEN A USER FORGETS PASSWORD AND WANTS TO RESET IT
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// THIS PROTECT MIDDLEWARE PROTECTS ALL USER ROUTES THAT COME AFTER IT SO DO NOT REQUIRE THE PROTECT IN EACH ROUTE
router.use(authController.protect);

// GETTING A USER USING THE LOGGED IN USER ID
router.get("/me", userController.getMe, userController.getUser);

// WHEN A USER IS LOGGED IN AND WANTS TO UPDATE THEIR PASSWORD
router.patch("/updateMyPassword", authController.updatePassword);

//WHEN A USER IS LOGGED IN WANTS TO UPDATE THEIR DATA AND NOT PASSWORD
router.patch("/updateMe", userController.updateMe);

// WHEN A USER WANTS TO DELETE(DEACTIVATE) THEIR ACCOUNT
router.delete("/deleteMe", userController.deleteMe);

// THIS MIDDLEWARE PRROTECTS ALL ROUTES THAT COME AFTER IT TO ALLOW ONLY ADMINS HAVE ACCESS
router.use(authController.restrictTo("admin"));

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
