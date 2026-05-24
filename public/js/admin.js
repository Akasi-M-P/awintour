import axios from "axios";
import { showAlert } from "./alerts";

export const initAdminActions = () => {
  document.querySelectorAll("[data-action='delete']").forEach(btn => {
    btn.addEventListener("click", async () => {
      const { id, resource } = btn.dataset;
      if (!confirm(`Delete this ${resource.slice(0, -1)}? This cannot be undone.`)) return;

      try {
        await axios({ method: "DELETE", url: `/api/v1/${resource}/${id}` });
        showAlert("success", "Deleted successfully.");
        btn.closest("tr").remove();
      } catch (err) {
        showAlert("error", err.response?.data?.message || "Delete failed.");
      }
    });
  });
};
