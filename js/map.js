'use strict';

/* Contact page: interactive Leaflet map with both branches and a "nearest branch" feature.
   Branch coordinates come from map-data.js. */

(function () {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  if (typeof L === 'undefined') {
    mapElement.textContent = 'The map could not be loaded. Please check your internet connection.';
    return;
  }

  const map = L.map('map');
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const markers = {};

  BRANCHES.forEach((branch) => {
    const popup = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = branch.name;
    const address = document.createElement('p');
    address.textContent = branch.street + ', Cape Town';
    const phone = document.createElement('a');
    phone.href = 'tel:' + branch.tel;
    phone.textContent = branch.phone;
    popup.append(title, address, phone);

    markers[branch.id] = L.marker([branch.lat, branch.lng], { title: branch.name })
      .addTo(map)
      .bindPopup(popup);
  });

  map.fitBounds(BRANCHES.map((b) => [b.lat, b.lng]), { padding: [50, 50] });

  function focusBranch(id) {
    const branch = BRANCHES.find((b) => b.id === id);
    map.flyTo([branch.lat, branch.lng], 16);
    markers[id].openPopup();
  }

  // "Show on map" buttons in the location cards
  document.querySelectorAll('.show-on-map').forEach((button) => {
    button.addEventListener('click', () => {
      focusBranch(button.dataset.branch);
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Straight-line distance between two points (Haversine formula), in km
  function distanceKm(a, b) {
    const R = 6371;
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  const nearestButton = document.getElementById('nearest-branch');
  const result = document.getElementById('nearest-result');

  nearestButton.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      result.textContent = 'Your browser does not support location. Please use the map to choose a branch.';
      return;
    }
    result.textContent = 'Finding your location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const me = { lat: position.coords.latitude, lng: position.coords.longitude };
        let nearest = BRANCHES[0];
        let best = Infinity;
        BRANCHES.forEach((branch) => {
          const d = distanceKm(me, branch);
          if (d < best) { best = d; nearest = branch; }
        });
        result.textContent = 'Your nearest branch is ' + nearest.name + ' (about ' + best.toFixed(1) + ' km away).';
        focusBranch(nearest.id);
      },
      () => {
        result.textContent = 'We could not get your location. Please allow location access or choose a branch on the map.';
      }
    );
  });
})();