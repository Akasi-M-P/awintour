import axios from "axios";
import { showAlert } from "./alerts";

export const initAdminActions = () => {
  // ── Delete ──────────────────────────────────────────────────────────────────
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

  // ── Toggle visibility (secretTour / active) ─────────────────────────────────
  document.querySelectorAll("[data-action='toggle']").forEach(btn => {
    btn.addEventListener("click", async () => {
      const { id, resource, field } = btn.dataset;
      const currentlyHidden = btn.dataset.value === "true"
        ? (field === "active" ? false : true)   // active=true means visible, secretTour=true means hidden
        : (field === "active" ? true : false);

      // For 'active': hidden means active=false, so toggling makes it active=true
      // For 'secretTour': hidden means secretTour=true, so toggling makes it secretTour=false
      const newFieldValue = field === "active"
        ? (btn.dataset.value === "true" ? false : true)
        : (btn.dataset.value === "true" ? false : true);

      try {
        await axios({
          method: "PATCH",
          url: `/api/v1/${resource}/${id}`,
          data: { [field]: newFieldValue },
        });

        const nowHidden = field === "active" ? !newFieldValue : newFieldValue;

        // Update data-value
        btn.dataset.value = String(newFieldValue);

        // Swap icon
        const use = btn.querySelector("use");
        use.setAttribute("xlink:href", `/img/icons.svg#icon-eye${nowHidden ? "-off" : ""}`);

        // Update title / aria-label
        const label = resource === "users"
          ? (nowHidden ? "Activate user" : "Deactivate user")
          : (nowHidden ? "Unhide tour" : "Hide tour");
        btn.title = label;
        btn.setAttribute("aria-label", label);

        // Dim the row when hidden
        btn.closest("tr").classList.toggle("admin-row--hidden", nowHidden);

        // Update Active/Inactive badge if users table
        if (resource === "users") {
          const badge = btn.closest("tr").querySelector(".admin-badge--yes, .admin-badge--no");
          if (badge) {
            badge.className = `admin-badge admin-badge--${nowHidden ? "no" : "yes"}`;
            badge.textContent = nowHidden ? "Inactive" : "Active";
          }
        }

        showAlert("success", nowHidden ? "Hidden successfully." : "Visible again.");
      } catch (err) {
        showAlert("error", err.response?.data?.message || "Toggle failed.");
      }
    });
  });
};
