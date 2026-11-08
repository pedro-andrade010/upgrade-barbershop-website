'use strict';

/* Shared features used on every page: scroll animation, modal window and accordion. */

document.documentElement.classList.add('js');

/* ---------- Scroll reveal animation (CSS transition + IntersectionObserver) ---------- */
const revealObserver = ('IntersectionObserver' in window)
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 })
  : null;

function revealOnScroll(root) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!revealObserver || reduceMotion) return;

  (root || document)
    .querySelectorAll('.card, .location, .promotion, .about, .faq-item, .gallery-item, .form')
    .forEach((element) => {
      if (element.classList.contains('reveal')) return;
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
}

/* ---------- Modal window (built with DOM methods) ---------- */
function openModal(title, contentNode) {
  const previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const box = document.createElement('div');
  box.className = 'modal';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'modal-title');

  const heading = document.createElement('h2');
  heading.id = 'modal-title';
  heading.textContent = title;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'modal-close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '\u00D7';

  const okButton = document.createElement('button');
  okButton.type = 'button';
  okButton.className = 'button';
  okButton.textContent = 'OK';

  box.append(closeButton, heading, contentNode, okButton);
  overlay.append(box);
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  function closeModal() {
    overlay.classList.remove('open');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => overlay.remove(), 250);
    if (previousFocus) previousFocus.focus();
  }

  function onKey(event) {
    if (event.key === 'Escape') closeModal();
  }

  closeButton.addEventListener('click', closeModal);
  okButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener('keydown', onKey);
  closeButton.focus();
}

/* ---------- Accordion (FAQ) ---------- */
function initAccordions() {
  document.querySelectorAll('.accordion').forEach((accordion) => {
    const buttons = accordion.querySelectorAll('.accordion-button');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const wasOpen = button.getAttribute('aria-expanded') === 'true';

        // Close every item first so only one is open at a time
        buttons.forEach((other) => {
          other.setAttribute('aria-expanded', 'false');
          document.getElementById(other.getAttribute('aria-controls')).style.maxHeight = null;
        });

        if (!wasOpen) {
          const panel = document.getElementById(button.getAttribute('aria-controls'));
          button.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });
}

window.UB = { reveal: revealOnScroll, openModal: openModal };

revealOnScroll();
initAccordions();