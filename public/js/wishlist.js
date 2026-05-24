const KEY = "natours_wishlist";

// ── Cookie helpers (server can also read this cookie) ─────────────────────────
const getCookieRaw = () => {
  const match = document.cookie.match(new RegExp("(?:^|;)\\s*" + KEY + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
};

export const getWishlist = () => {
  try {
    return JSON.parse(getCookieRaw() || localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

const saveWishlist = (list) => {
  const encoded = encodeURIComponent(JSON.stringify(list));
  // Write a 1-year cookie readable by the server (no httpOnly)
  document.cookie = `${KEY}=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
  localStorage.setItem(KEY, JSON.stringify(list));
};

// ── Explicit remove buttons on wishlist page ──────────────────────────────────
export const initWishlistRemove = () => {
  document.querySelectorAll(".wishlist-remove-btn[data-tour-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tourId = btn.dataset.tourId;
      const list = getWishlist().filter(id => id !== tourId);
      saveWishlist(list);
      const card = btn.closest(".booking-card");
      if (card) card.remove();
      const list$ = document.querySelector(".wishlist-list");
      if (list$ && !list$.querySelector(".booking-card")) {
        list$.outerHTML = `<div class="no-results">
          <p>No saved tours yet. Click the ♥ on any tour card to save it here.</p>
          <a class="btn btn--green" href="/">Browse tours</a>
        </div>`;
      }
    });
  });
};

// ── Heart buttons on tour cards ───────────────────────────────────────────────
export const initWishlistButtons = () => {
  document.querySelectorAll(".card[data-tour-id]").forEach((card) => {
    const tourId  = card.dataset.tourId;
    const picture = card.querySelector(".card__picture");
    if (!picture || picture.querySelector(".card__wishlist-btn")) return;

    const btn = document.createElement("button");
    btn.className = "card__wishlist-btn";
    btn.title = "Save to wishlist";
    btn.setAttribute("aria-label", "Save to wishlist");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`;

    if (getWishlist().includes(tourId)) btn.classList.add("card__wishlist-btn--active");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const list = getWishlist();
      const idx  = list.indexOf(tourId);
      if (idx === -1) {
        list.push(tourId);
        btn.classList.add("card__wishlist-btn--active");
      } else {
        list.splice(idx, 1);
        btn.classList.remove("card__wishlist-btn--active");
        // If on the wishlist page, remove the card from view
        if (document.querySelector(".wishlist-grid")) card.remove();
      }
      saveWishlist(list);
    });

    picture.appendChild(btn);
  });
};
