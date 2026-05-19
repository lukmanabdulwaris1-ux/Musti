'use strict';

/* ===== LOADER ===== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 800);
});

/* ===== STICKY HEADER ===== */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
  backToTop.classList.toggle('visible', window.scrollY > 400);
  updateActiveNav();
});

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* ===== ACTIVE NAV ON SCROLL ===== */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = nav.querySelectorAll('a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

/* ===== TYPED TEXT EFFECT ===== */
const typedEl = document.getElementById('typed-text');
const words = ['Royalty', 'Excellence', 'Every Occasion', 'You'];
let wordIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
  const current = words[wordIndex];
  typedEl.textContent = isDeleting
    ? current.substring(0, charIndex--)
    : current.substring(0, charIndex++);

  let delay = isDeleting ? 60 : 110;
  if (!isDeleting && charIndex === current.length + 1) {
    delay = 1800; isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    delay = 400;
  }
  setTimeout(typeEffect, delay);
}
typeEffect();

/* ===== COUNTER ANIMATION ===== */
function animateCounters() {
  document.querySelectorAll('.count').forEach(el => {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}
let countersStarted = false;

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
      // Trigger counters when hero stats become visible
      if (!countersStarted && entry.target.closest('.hero')) {
        countersStarted = true;
        animateCounters();
      }
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  revealObserver.observe(el);
});

// Trigger counters on scroll into hero stats
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      animateCounters();
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

/* ===== GALLERY FILTER ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.style.display = show ? 'block' : 'none';
      if (show) {
        item.style.animation = 'none';
        item.offsetHeight; // reflow
        item.style.animation = 'fadeIn 0.4s ease forwards';
      }
    });
  });
});

/* ===== LIGHTBOX ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const src = item.querySelector('img').src;
    const alt = item.querySelector('img').alt;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* ===== TESTIMONIAL SLIDER ===== */
const track = document.getElementById('testimonialTrack');
const cards = track.querySelectorAll('.testimonial-card');
const dotsContainer = document.getElementById('sliderDots');
let current = 0;
let autoSlide;

// Build dots
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Slide ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});

function goTo(index) {
  current = (index + cards.length) % cards.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
}

document.getElementById('prevBtn').addEventListener('click', () => { goTo(current - 1); resetAuto(); });
document.getElementById('nextBtn').addEventListener('click', () => { goTo(current + 1); resetAuto(); });

function startAuto() { autoSlide = setInterval(() => goTo(current + 1), 5000); }
function resetAuto() { clearInterval(autoSlide); startAuto(); }
startAuto();

// Touch/swipe support
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
});

/* ===== BOOKING FORM VALIDATION ===== */
const bookingForm = document.getElementById('bookingForm');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const submitText = document.getElementById('submitText');
  const submitLoader = document.getElementById('submitLoader');
  const formSuccess = document.getElementById('formSuccess');

  submitText.style.display = 'none';
  submitLoader.style.display = 'inline';
  bookingForm.querySelector('button[type="submit"]').disabled = true;

  // Simulate async submission (replace with real API call)
  await new Promise(resolve => setTimeout(resolve, 1800));

  submitText.style.display = 'inline';
  submitLoader.style.display = 'none';
  bookingForm.querySelector('button[type="submit"]').disabled = false;
  formSuccess.style.display = 'block';
  bookingForm.reset();

  setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
});

function validateForm() {
  let valid = true;
  const rules = [
    { id: 'fname', errId: 'fnameError', msg: 'Please enter your full name.' },
    { id: 'phone', errId: 'phoneError', msg: 'Please enter your phone number.' },
    { id: 'service', errId: 'serviceError', msg: 'Please select a service.' },
    { id: 'date', errId: 'dateError', msg: 'Please select a preferred date.' },
  ];
  rules.forEach(({ id, errId, msg }) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el.value.trim()) {
      el.classList.add('error');
      err.textContent = msg;
      valid = false;
    } else {
      el.classList.remove('error');
      err.textContent = '';
    }
  });
  // Date must be in the future
  const dateEl = document.getElementById('date');
  if (dateEl.value) {
    const selected = new Date(dateEl.value);
    const today = new Date(); today.setHours(0,0,0,0);
    if (selected < today) {
      dateEl.classList.add('error');
      document.getElementById('dateError').textContent = 'Please select a future date.';
      valid = false;
    }
  }
  return valid;
}

// Clear error on input
bookingForm.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const errEl = document.getElementById(el.id + 'Error');
    if (errEl) errEl.textContent = '';
  });
});

/* ===== BACK TO TOP ===== */
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== FADE-IN KEYFRAME (for gallery filter) ===== */
const style = document.createElement('style');
style.textContent = '@keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }';
document.head.appendChild(style);
