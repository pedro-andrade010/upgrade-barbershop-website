'use strict';

/* Services page: loads the service cards from SERVICES (services-data.js)
   and lets the visitor search, filter by category and sort them. */

(function () {
  const list = document.getElementById('service-list');
  if (!list) return;

  const searchInput = document.getElementById('service-search');
  const categorySelect = document.getElementById('service-category');
  const sortSelect = document.getElementById('service-sort');
  const countText = document.getElementById('service-count');

  function createCard(service) {
    const card = document.createElement('div');
    card.className = 'card';

    const image = document.createElement('img');
    image.src = service.image;
    image.alt = service.alt;
    image.loading = 'lazy';
    image.decoding = 'async';

    const title = document.createElement('h2');
    title.textContent = service.name;

    const description = document.createElement('p');
    description.textContent = service.description;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = 'R' + service.price;

    const book = document.createElement('a');
    book.className = 'button';
    book.textContent = 'BOOK';
    book.href = 'contact.html?service=' + encodeURIComponent(service.name) + '#booking';

    card.append(image, title, description, price, book);
    return card;
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;

    const items = SERVICES.filter((service) => {
      const text = (service.name + ' ' + service.description).toLowerCase();
      const matchesText = text.includes(query);
      const matchesCategory = category === 'all' || service.category === category;
      return matchesText && matchesCategory;
    });

    switch (sortSelect.value) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break; // keep the original (featured) order
    }

    list.replaceChildren(...items.map(createCard));
    UB.reveal(list);

    countText.textContent = items.length === 0
      ? 'No services match your search. Try a different word or category.'
      : 'Showing ' + items.length + ' of ' + SERVICES.length + ' services';
  }

  searchInput.addEventListener('input', render);
  categorySelect.addEventListener('change', render);
  sortSelect.addEventListener('change', render);

  render();
})();