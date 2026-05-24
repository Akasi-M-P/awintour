export const initLightbox = () => {
  const images = document.querySelectorAll(".picture-box__img");
  if (!images.length) return;

  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML = `
    <button class="lightbox__close" aria-label="Close">&times;</button>
    <button class="lightbox__prev" aria-label="Previous">&#8249;</button>
    <button class="lightbox__next" aria-label="Next">&#8250;</button>
    <div class="lightbox__img-wrap">
      <img class="lightbox__img" src="" alt="Tour photo">
    </div>
    <div class="lightbox__dots"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg  = overlay.querySelector(".lightbox__img");
  const dots   = overlay.querySelector(".lightbox__dots");
  const srcs   = Array.from(images).map(img => img.src);
  let current  = 0;

  srcs.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "lightbox__dot";
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => showImage(i));
    dots.appendChild(dot);
  });

  const showImage = (idx) => {
    current = (idx + srcs.length) % srcs.length;
    lbImg.src = srcs[current];
    overlay.querySelectorAll(".lightbox__dot").forEach((d, i) =>
      d.classList.toggle("active", i === current)
    );
  };

  const close = () => {
    overlay.classList.remove("lightbox--open");
    document.body.style.overflow = "";
  };

  images.forEach((img, i) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      overlay.classList.add("lightbox--open");
      document.body.style.overflow = "hidden";
      showImage(i);
    });
  });

  overlay.querySelector(".lightbox__close").addEventListener("click", close);
  overlay.querySelector(".lightbox__prev").addEventListener("click", () => showImage(current - 1));
  overlay.querySelector(".lightbox__next").addEventListener("click", () => showImage(current + 1));
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

  document.addEventListener("keydown", e => {
    if (!overlay.classList.contains("lightbox--open")) return;
    if (e.key === "ArrowRight") showImage(current + 1);
    if (e.key === "ArrowLeft")  showImage(current - 1);
    if (e.key === "Escape")     close();
  });
};
