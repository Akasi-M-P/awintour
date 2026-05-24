import "@babel/polyfill";
import { login, logout } from "./login";
import { signup } from "./signup";
import { displayMap } from "./mapbox";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";
import { forgotPassword, resetPassword } from "./forgotPassword";
import { submitReview, deleteReview, updateReview } from "./review";
import { initTourFilter } from "./tourFilter";
import { initLightbox } from "./lightbox";
import { initWishlistButtons, initWishlistRemove } from "./wishlist";
import { initAdminActions } from "./admin";
import { initAdminBooking } from "./adminBooking";
import { initCreateTour } from "./createTour";
import {
  initCardTilt,
  initMagneticButtons,
  initRipple,
  initParticles,
  initSectionReveal,
  initHeroParallax,
  initHeroTextReveal,
} from "./animations";

// ── Global animations (every page) ────────────────────────────────────────────
initParticles();
initRipple();
initMagneticButtons();

// Header shadow on scroll
const header = document.querySelector(".header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("header--scrolled", window.scrollY > 40);
  });
}

// ── Map ────────────────────────────────────────────────────────────────────────
displayMap(document.getElementById("map"));

// ── Wishlist page remove buttons ──────────────────────────────────────────────
initWishlistRemove();

// ── Pages with tour cards (overview + wishlist) ───────────────────────────────
const cards = document.querySelectorAll(".card");
if (cards.length) {
  initCardTilt();
  initWishlistButtons();
  initHeroTextReveal();

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("card--visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.08 }
  );
  cards.forEach(c => io.observe(c));
}

initTourFilter();

// ── Tour detail page ───────────────────────────────────────────────────────────
initSectionReveal();
initHeroParallax();
initLightbox();

// ── Review form (tour detail) ─────────────────────────────────────────────────
const reviewForm = document.querySelector(".review-form");
if (reviewForm) {
  reviewForm.addEventListener("submit", async e => {
    e.preventDefault();
    const tourId   = reviewForm.dataset.tourId;
    const rating   = reviewForm.querySelector("input[name='rating']:checked")?.value;
    const review   = document.getElementById("review").value;
    if (!rating) { import("./alerts").then(m => m.showAlert("error", "Please select a star rating.")); return; }
    await submitReview(tourId, rating, review);
  });
}

// ── Review edit/delete (tour detail + my-reviews) ─────────────────────────────
let activeReviewId = null;
const editModal     = document.querySelector(".review-edit-modal");
const editTextarea  = document.getElementById("edit-review-text");
const confirmEdit   = document.getElementById("confirm-edit");
const cancelEdit    = document.getElementById("cancel-edit");

document.querySelectorAll("[data-action='edit-review']").forEach(btn => {
  btn.addEventListener("click", () => {
    activeReviewId = btn.dataset.reviewId;
    const rating   = btn.dataset.rating;
    const text     = btn.dataset.text;
    if (editModal) {
      const radioToCheck = editModal.querySelector(`input[name='edit-rating'][value='${rating}']`);
      if (radioToCheck) radioToCheck.checked = true;
      if (editTextarea) editTextarea.value = text;
      editModal.classList.add("review-edit-modal--open");
    }
  });
});

document.querySelectorAll("[data-action='delete-review']").forEach(btn => {
  btn.addEventListener("click", () => deleteReview(btn.dataset.reviewId));
});

if (confirmEdit) {
  confirmEdit.addEventListener("click", async () => {
    const rating = editModal.querySelector("input[name='edit-rating']:checked")?.value;
    const review = editTextarea?.value;
    if (!rating || !review) return;
    await updateReview(activeReviewId, rating, review);
  });
}
if (cancelEdit) cancelEdit.addEventListener("click", () => editModal.classList.remove("review-edit-modal--open"));
if (editModal) {
  editModal.querySelector(".review-edit-modal__backdrop")?.addEventListener("click", () =>
    editModal.classList.remove("review-edit-modal--open")
  );
}

// ── My reviews page ────────────────────────────────────────────────────────────
document.querySelectorAll("[data-action='edit']").forEach(btn => {
  btn.addEventListener("click", () => {
    activeReviewId = btn.dataset.reviewId;
    if (editModal) {
      const r = editModal.querySelector(`input[name='edit-rating'][value='${btn.dataset.rating}']`);
      if (r) r.checked = true;
      if (editTextarea) editTextarea.value = btn.dataset.text;
      editModal.classList.add("review-edit-modal--open");
    }
  });
});
document.querySelectorAll("[data-action='delete']").forEach(btn => {
  if (btn.dataset.resource) return; // handled by admin.js
  btn.addEventListener("click", () => deleteReview(btn.dataset.reviewId));
});

// ── Admin dashboard ────────────────────────────────────────────────────────────
initAdminActions();
initAdminBooking();
initCreateTour();

// ── Auth forms ─────────────────────────────────────────────────────────────────
const loginForm    = document.querySelector(".form--login");
const signupForm   = document.querySelector(".form--signup");
const forgotForm   = document.querySelector(".form--forgot-password");
const resetForm    = document.querySelector(".form--reset-password");
const logOutBtn    = document.querySelector(".nav__el--logout");

if (loginForm)
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    login(document.getElementById("email").value, document.getElementById("password").value);
  });

if (signupForm)
  signupForm.addEventListener("submit", e => {
    e.preventDefault();
    signup(
      document.getElementById("name").value,
      document.getElementById("email").value,
      document.getElementById("password").value,
      document.getElementById("passwordConfirm").value
    );
  });

if (forgotForm)
  forgotForm.addEventListener("submit", e => {
    e.preventDefault();
    const btn = forgotForm.querySelector("button[type='submit']");
    btn.textContent = "Sending…";
    forgotPassword(document.getElementById("email").value).finally(() => {
      btn.textContent = "Send reset link";
    });
  });

if (resetForm)
  resetForm.addEventListener("submit", e => {
    e.preventDefault();
    const token = resetForm.dataset.token;
    resetPassword(
      document.getElementById("password").value,
      document.getElementById("passwordConfirm").value,
      token
    );
  });

if (logOutBtn) logOutBtn.addEventListener("click", logout);

// ── Account settings form ──────────────────────────────────────────────────────
const userDataForm     = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");

if (userDataForm)
  userDataForm.addEventListener("submit", e => {
    e.preventDefault();
    const form = new FormData();
    form.append("name",  document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    updateSettings(form, "data");
  });

if (userPasswordForm)
  userPasswordForm.addEventListener("submit", e => {
    e.preventDefault();
    const btn = document.querySelector(".btn--save-password");
    btn.textContent = "Updating…";
    const passwordCurrent = document.getElementById("password-current").value;
    const password        = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    updateSettings({ passwordCurrent, password, passwordConfirm }, "password").finally(() => {
      btn.textContent = "Save password";
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    });
  });

// ── Book tour ──────────────────────────────────────────────────────────────────
const bookBtn = document.getElementById("book-tour");
if (bookBtn)
  bookBtn.addEventListener("click", e => {
    e.target.textContent = "Processing…";
    bookTour(e.target.dataset.tourId);
  });
