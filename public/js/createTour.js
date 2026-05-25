import axios from "axios";
import { showAlert } from "./alerts";

// ── Image preview helpers ─────────────────────────────────────────────────────
const setupPreview = (inputId, previewId, multi = false) => {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    preview.innerHTML = "";
    const files = multi ? Array.from(input.files).slice(0, 3) : [input.files[0]];
    files.forEach(file => {
      if (!file) return;
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.className = "file-preview__img";
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.appendChild(img);
    });
  });
};

// ── Edit tour ─────────────────────────────────────────────────────────────────
export const initEditTour = () => {
  const form = document.querySelector(".form--edit-tour");
  if (!form) return;

  // Replace previews when new files selected
  const coverInput   = document.getElementById("imageCover");
  const galleryInput = document.getElementById("images");
  const coverPreview   = document.getElementById("cover-preview");
  const galleryPreview = document.getElementById("gallery-preview");

  coverInput?.addEventListener("change", () => {
    if (!coverInput.files[0]) return;
    coverPreview.innerHTML = "";
    const img = document.createElement("img");
    img.src = URL.createObjectURL(coverInput.files[0]);
    img.className = "file-preview__img";
    img.onload = () => URL.revokeObjectURL(img.src);
    coverPreview.appendChild(img);
  });

  galleryInput?.addEventListener("change", () => {
    galleryPreview.innerHTML = "";
    Array.from(galleryInput.files).slice(0, 3).forEach(file => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.className = "file-preview__img";
      img.onload = () => URL.revokeObjectURL(img.src);
      galleryPreview.appendChild(img);
    });
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn    = form.querySelector("button[type='submit']");
    const tourId = form.dataset.tourId;
    btn.textContent = "Saving…";
    btn.disabled    = true;

    try {
      const fd = new FormData(form);
      ["priceDiscount", "startDate2", "startDate3", "startLocationAddress"]
        .forEach(k => { if (!fd.get(k)?.toString().trim()) fd.delete(k); });

      const res = await axios.patch(`/api/v1/tours/admin-update/${tourId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert("success", `"${res.data.data.tour.name}" updated!`);
      setTimeout(() => window.location.assign("/manage-tours"), 1500);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update tour.");
      btn.textContent = "Save Changes";
      btn.disabled    = false;
    }
  });
};

// ── Create tour ───────────────────────────────────────────────────────────────
export const initCreateTour = () => {
  const form = document.querySelector(".form--create-tour");
  if (!form) return;

  setupPreview("imageCover", "cover-preview", false);
  setupPreview("images",     "gallery-preview", true);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']");
    btn.textContent = "Creating…";
    btn.disabled    = true;

    try {
      const fd = new FormData(form);

      // Drop empty optional fields so they don't override defaults
      ["priceDiscount", "description", "startDate2", "startDate3",
       "startLocationAddress"].forEach(k => {
        if (!fd.get(k)?.toString().trim()) fd.delete(k);
      });

      const res = await axios.post("/api/v1/tours/admin-create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert("success", `"${res.data.data.tour.name}" created!`);
      setTimeout(() => window.location.assign("/manage-tours"), 1500);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to create tour.");
      btn.textContent = "Create Tour";
      btn.disabled    = false;
    }
  });
};
