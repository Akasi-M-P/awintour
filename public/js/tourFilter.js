export const initTourFilter = () => {
  const filterForm = document.querySelector(".filter-form");
  if (!filterForm) return;

  const searchInput  = document.getElementById("filter-search");
  const diffBtns     = document.querySelectorAll(".filter__diff-btn");
  const priceInput   = document.getElementById("filter-price");
  const priceDisplay = document.getElementById("filter-price-display");
  const clearBtn     = document.querySelector(".filter__clear-btn");

  // Restore state from URL
  const params = new URLSearchParams(window.location.search);
  if (searchInput && params.get("search")) searchInput.value = params.get("search");
  const priceMax = params.get("price[lte]") || (params.get("price") && params.get("price[lte]"));
  if (priceInput && priceMax) {
    priceInput.value = priceMax;
    if (priceDisplay) priceDisplay.textContent = `$${priceMax}`;
  }
  diffBtns.forEach(btn => {
    if (btn.dataset.difficulty === params.get("difficulty"))
      btn.classList.add("active");
  });

  // Live price label
  if (priceInput) {
    priceInput.addEventListener("input", () => {
      if (priceDisplay) priceDisplay.textContent = `$${priceInput.value}`;
    });
  }

  // Difficulty toggle
  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const wasActive = btn.classList.contains("active");
      diffBtns.forEach(b => b.classList.remove("active"));
      if (!wasActive) btn.classList.add("active");
    });
  });

  // Submit → build query string
  filterForm.addEventListener("submit", e => {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (searchInput && searchInput.value.trim()) qs.set("search", searchInput.value.trim());
    const activeBtn = document.querySelector(".filter__diff-btn.active");
    if (activeBtn) qs.set("difficulty", activeBtn.dataset.difficulty);
    if (priceInput && Number(priceInput.value) < Number(priceInput.max))
      qs.set("price[lte]", priceInput.value);
    window.location.href = `/?${qs.toString()}`;
  });

  if (clearBtn) clearBtn.addEventListener("click", () => (window.location.href = "/"));
};
