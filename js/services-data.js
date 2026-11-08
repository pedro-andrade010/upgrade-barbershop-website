'use strict';

/* Service data used by services.js (listing) and forms.js (prices in responses).
   Edit the services here to change what the Services page shows. */
const SERVICES = [
  {
    "id": "classic",
    "name": "Classic Haircut",
    "description": "A clean and personalised haircut.",
    "price": 180,
    "duration": 30,
    "category": "haircuts",
    "image": "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?auto=format&fit=crop&w=700&q=80",
    "alt": "Classic haircut at Upgrade Barbershop in Cape Town"
  },
  {
    "id": "hair-beard",
    "name": "Hair + Beard",
    "description": "A complete grooming service.",
    "price": 250,
    "duration": 45,
    "category": "packages",
    "image": "https://images.pexels.com/photos/9992819/pexels-photo-9992819.jpeg?auto=compress&cs=tinysrgb&w=700",
    "alt": "Hair and beard grooming service"
  },
  {
    "id": "beard",
    "name": "Beard Grooming",
    "description": "Professional beard shaping.",
    "price": 120,
    "duration": 20,
    "category": "beard",
    "image": "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=700&q=80",
    "alt": "Professional beard shaping and grooming"
  },
  {
    "id": "premium",
    "name": "Premium Upgrade",
    "description": "A complete grooming experience.",
    "price": 320,
    "duration": 60,
    "category": "packages",
    "image": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=80",
    "alt": "Premium haircut and grooming experience"
  },
  {
    "id": "kids",
    "name": "Kids Haircut",
    "description": "A simple haircut for younger clients.",
    "price": 140,
    "duration": 25,
    "category": "haircuts",
    "image": "https://images.pexels.com/photos/7697477/pexels-photo-7697477.jpeg?auto=compress&cs=tinysrgb&w=700",
    "alt": "Kids haircut at Upgrade Barbershop"
  },
  {
    "id": "styling",
    "name": "Styling",
    "description": "Finishing and styling service.",
    "price": 100,
    "duration": 15,
    "category": "styling",
    "image": "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?auto=format&fit=crop&w=700&q=80",
    "alt": "Hair styling and finishing"
  }
];

function findService(name) {
  return SERVICES.find((service) => service.name === name);
}