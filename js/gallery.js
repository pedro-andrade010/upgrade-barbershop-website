'use strict';

/* Gallery page: lightbox that shows a clicked image in a larger view. */

(function () {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  if (items.length === 0) return;

  let current = 0;
  let lastFocused = null;
  let overlay, bigImage, caption, closeButton;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'lightbox-close';
    closeButton.setAttribute('aria-label', 'Close image viewer');
    closeButton.textContent = '\u00D7';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'lightbox-nav lightbox-prev';
    prev.setAttribute('aria-label', 'Previous image');
    prev.textContent = '\u2039';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'lightbox-nav lightbox-next';
    next.setAttribute('aria-label', 'Next image');
    next.textContent = '\u203A';

    const figure = document.createElement('figure');
    bigImage = document.createElement('img');
    caption = document.createElement('figcaption');
    figure.append(bigImage, caption);

    overlay.append(closeButton, prev, figure, next);
    document.body.append(overlay);

    closeButton.addEventListener('click', close);
    prev.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target === figure) close();
    });
  }

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    bigImage.src = item.dataset.full;
    bigImage.alt = item.querySelector('img').alt;
    caption.textContent = item.dataset.caption + ' (' + (current + 1) + ' of ' + items.length + ')';
  }

  function onKey(event) {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  }

  function open(index) {
    lastFocused = document.activeElement;
    if (!overlay) build();
    show(index);
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', onKey);
    closeButton.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', onKey);
    if (lastFocused) lastFocused.focus();
  }

  items.forEach((item, index) => item.addEventListener('click', () => open(index)));
})();