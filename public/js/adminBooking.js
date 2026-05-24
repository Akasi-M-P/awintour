import axios from "axios";
import { showAlert } from "./alerts";

export const initAdminBooking = () => {
  const btn = document.getElementById("admin-book-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const form      = document.querySelector(".admin-book-form");
    const tourId    = form.dataset.tourId;
    const userEmail = document.getElementById("admin-book-email").value.trim();

    if (!userEmail) { showAlert("error", "Please enter a user email address."); return; }

    btn.textContent = "Booking…";
    btn.disabled    = true;

    try {
      const res = await axios({
        method: "POST",
        url: "/api/v1/bookings/admin-book",
        data: { tourId, userEmail },
      });
      showAlert("success", res.data.message);
      document.getElementById("admin-book-email").value = "";
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Booking failed.");
    } finally {
      btn.textContent = "Book for user";
      btn.disabled    = false;
    }
  });
};
