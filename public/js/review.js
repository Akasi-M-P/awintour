import axios from "axios";
import { showAlert } from "./alerts";

export const submitReview = async (tourId, rating, review) => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/tours/${tourId}/reviews`,
      data: { rating: Number(rating), review },
    });
    if (res.data.status === "success") {
      showAlert("success", "Review submitted! Thank you.");
      window.setTimeout(() => location.reload(), 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    await axios({ method: "DELETE", url: `/api/v1/reviews/${reviewId}` });
    showAlert("success", "Review deleted.");
    window.setTimeout(() => location.reload(), 1000);
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const updateReview = async (reviewId, rating, review) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/reviews/${reviewId}`,
      data: { rating: Number(rating), review },
    });
    if (res.data.status === "success") {
      showAlert("success", "Review updated!");
      window.setTimeout(() => location.reload(), 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
