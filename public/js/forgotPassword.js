import axios from "axios";
import { showAlert } from "./alerts";

export const forgotPassword = async (email) => {
  try {
    const res = await axios({ method: "POST", url: "/api/v1/users/forgotPassword", data: { email } });
    if (res.data.status === "success")
      showAlert("success", "Reset link sent! Check your email.");
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const resetPassword = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/resetPassword/${token}`,
      data: { password, passwordConfirm },
    });
    if (res.data.status === "success") {
      showAlert("success", "Password reset! Redirecting…");
      window.setTimeout(() => location.assign("/"), 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
