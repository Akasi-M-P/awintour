import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: { email, password },
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => location.assign("/"), 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

const showLogoutModal = () =>
  new Promise(resolve => {
    const modal = document.getElementById("logout-modal");
    if (!modal) { resolve(true); return; }

    modal.classList.add("logout-modal--open");

    const confirm  = document.getElementById("logout-confirm");
    const cancel   = document.getElementById("logout-cancel");

    const done = (result) => {
      modal.classList.remove("logout-modal--open");
      confirm.removeEventListener("click", onConfirm);
      cancel.removeEventListener("click",  onCancel);
      modal.removeEventListener("click",   onOverlay);
      document.removeEventListener("keydown", onKey);
      resolve(result);
    };

    const onConfirm = () => done(true);
    const onCancel  = () => done(false);
    const onOverlay = (e) => { if (e.target === modal || e.target.classList.contains("logout-modal__backdrop")) done(false); };
    const onKey     = (e) => { if (e.key === "Escape") done(false); };

    confirm.addEventListener("click", onConfirm);
    cancel.addEventListener("click",  onCancel);
    modal.addEventListener("click",   onOverlay);
    document.addEventListener("keydown", onKey);
  });

export const logout = async () => {
  const confirmed = await showLogoutModal();
  if (!confirmed) return;
  try {
    const res = await axios({ method: "GET", url: "/api/v1/users/logout" });
    if (res.data.status === "success") location.assign("/");
  } catch (error) {
    showAlert("error", "Error logging out! Try again");
  }
};
