const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

// Public / isLoggedIn pages
router.get("/",                  authController.isLoggedIn, viewController.getOverview);
router.get("/tour/:slug",        authController.isLoggedIn, viewController.getTour);
router.get("/login",             authController.isLoggedIn, viewController.getLoginForm);
router.get("/signup",            authController.isLoggedIn, viewController.getSignupForm);
router.get("/forgot-password",   authController.isLoggedIn, viewController.getForgotPasswordForm);
router.get("/reset-password/:token",                        viewController.getResetPasswordForm);

// Protected — any logged-in user
router.get("/me",           authController.protect, viewController.getAccount);
router.get("/my-tours",     authController.protect, viewController.getMyTours);
router.get("/my-reviews",   authController.protect, viewController.getMyReviews);
router.get("/wishlist",     authController.protect, viewController.getWishlist);

router.post("/submit-user-data", authController.protect, viewController.updateUserData);

// Protected — admin only
router.get("/manage-tours",    authController.protect, authController.restrictTo("admin"), viewController.getManageTours);
router.get("/create-tour",     authController.protect, authController.restrictTo("admin"), viewController.getCreateTourForm);
router.get("/edit-tour/:id",   authController.protect, authController.restrictTo("admin"), viewController.getEditTourForm);
router.get("/manage-users",    authController.protect, authController.restrictTo("admin"), viewController.getManageUsers);
router.get("/manage-reviews",  authController.protect, authController.restrictTo("admin"), viewController.getManageReviews);
router.get("/manage-bookings", authController.protect, authController.restrictTo("admin"), viewController.getManageBookings);

module.exports = router;
