/* ============================================================
   ANIMATIONS — 3D tilt · magnetic buttons · particles
   ripple · section reveals · hero parallax
   ============================================================ */

// 3D Card Tilt + holographic shine
export const initCardTilt = () => {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  cards.forEach(card => {
    const shine = document.createElement('div');
    shine.className = 'card__shine';
    card.appendChild(shine);

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform .08s ease, box-shadow .3s ease';
    });

    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      const rotX = ((y / height) - 0.5) * -22;
      const rotY = ((x / width)  - 0.5) *  22;

      card.style.transform =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.05,1.05,1.05)`;

      const px = (x / width)  * 100;
      const py = (y / height) * 100;
      shine.style.opacity = '1';
      shine.style.background = `
        radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.2) 0%, transparent 60%),
        linear-gradient(135deg,
          rgba(85,197,122,.1) 0%,
          rgba(126,207,245,.1) 50%,
          rgba(167,139,250,.1) 100%)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition =
        'transform .65s cubic-bezier(0.23,1,0.32,1), box-shadow .4s ease';
      card.style.transform = '';
      shine.style.opacity = '0';
    });
  });
};

// Magnetic buttons — subtly pull toward cursor
export const initMagneticButtons = () => {
  const btns = document.querySelectorAll('.btn--green:not(.btn--full)');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = (e.clientX - left - width  / 2) * 0.3;
      const y = (e.clientY - top  - height / 2) * 0.3;
      btn.style.transition = 'transform .1s ease';
      btn.style.transform  = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .55s cubic-bezier(0.23,1,0.32,1)';
      btn.style.transform  = '';
    });
  });
};

// Click ripple on any .btn
export const initRipple = () => {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const { left, top } = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - left - 5}px`;
    ripple.style.top  = `${e.clientY - top  - 5}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
};

// Floating particle network
export const initParticles = () => {
  if (document.querySelector('.particles-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'particles-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#55c57a', '#7ecff5', '#a78bfa', '#f472b6'];

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.r  = Math.random() * 1.6 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.38;
      this.vy = (Math.random() - 0.5) * 0.38;
      this.a  = Math.random() * 0.45 + 0.05;
      this.c  = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -5 || this.x > canvas.width + 5 ||
          this.y < -5 || this.y > canvas.height + 5) this.init();
    }
    draw() {
      ctx.globalAlpha = this.a;
      ctx.fillStyle   = this.c;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const pts = Array.from({ length: 90 }, () => new Particle());

  const drawLines = () => {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx   = pts[i].x - pts[j].x;
        const dy   = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.globalAlpha = (1 - dist / 130) * 0.13;
          ctx.strokeStyle = '#55c57a';
          ctx.lineWidth   = 0.7;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
  };

  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => { p.step(); p.draw(); });
    drawLines();
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  };
  loop();
};

// Tour detail — section scroll reveal
export const initSectionReveal = () => {
  const sections = document.querySelectorAll(
    '.section-description, .section-pictures, .section-map, .section-reviews, .section-cta'
  );
  if (!sections.length) return;

  sections.forEach(s => s.classList.add('js-reveal'));

  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('section--visible');
      io.unobserve(e.target);
    }),
    { threshold: 0.07 }
  );
  sections.forEach(s => io.observe(s));
};

// Tour detail — hero parallax depth
export const initHeroParallax = () => {
  const img = document.querySelector('.header__hero-img');
  if (!img) return;
  window.addEventListener('scroll', () => {
    img.style.transform = `scale(1.08) translateY(${window.scrollY * 0.22}px)`;
  }, { passive: true });
};

// Overview hero — staggered word reveal
export const initHeroTextReveal = () => {
  const words = document.querySelectorAll('.hero-word');
  words.forEach((w, i) => {
    w.style.animationDelay = `${i * 0.12}s`;
    w.classList.add('hero-word--animate');
  });
};
