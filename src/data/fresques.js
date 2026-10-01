// Configuration for the 3 murals on the trail.
// Technical fields are read by the store; the rest by the views.
// Each anchor's `vue` is where the visitor must stand for that fragment to appear.

// Campus de Nouville, framed on the three murals rather than on the whole site.
export const CENTRE_PARCOURS = { lat: -22.26264, lng: 166.40493, zoom: 17 }

// Positions derived from the OSM landmarks named in `lieu` (BU, restaurant
// universitaire, amphithéâtre 250). ⚠️ Still to confirm wall by wall on site.
export const FRESQUES = [
  {
    id: 'hibiscus',
    nom: 'Hibiscus',
    nomCourt: "L'hibiscus",
    sousTitre: 'La chimie des couleurs',
    lieu: 'BU · Terrasse Sisters Food',
    indice: 'Sous la coursive, le long de la terrasse en bois.',
    photo: '/fresques/hibiscus.jpg',
    cadrage: 'center 58%',
    couleur: 'terre',
    lat: -22.26268,
    lng: 166.40458,
    rayon: 18,
    nbFragments: 3,
    cibleAR: '/ar/hibiscus/targets.mind',
    cible: { x: 0.06, y: 0.153, w: 0.873, h: 0.753 },
    ancrages: [
      { u: 0.4, v: 0.12, vue: 'face' },
      { u: 0.12, v: 0.27, vue: 'gauche' },
      { u: 0.87, v: 0.81, vue: 'droite' },
    ],
    foyer: { u: 0.87, v: 0.81 },
  },
  {
    id: 'loriquet',
    nom: 'Loriquet',
    nomCourt: 'Le loriquet',
    sousTitre: 'Le langage des plumes',
    lieu: 'Terrasse de la BU',
    indice: "À l'entrée du patio, contre la baie vitrée.",
    photo: '/fresques/loriquet.jpg',
    couleur: 'prune',
    lat: -22.2629,
    lng: 166.4048,
    rayon: 18,
    nbFragments: 3,
    cibleAR: '/ar/loriquet/targets.mind',
    cible: { x: 0.1125, y: 0, w: 0.86, h: 0.983 },
    ancrages: [
      { u: 0.54, v: 0.07, vue: 'face' },
      { u: 0.16, v: 0.23, vue: 'gauche' },
      { u: 0.46, v: 0.83, vue: 'droite' },
    ],
    foyer: { u: 0.46, v: 0.83 },
  },
  {
    id: 'tortue',
    nom: 'Tortue marine',
    nomCourt: 'La tortue',
    sousTitre: 'Les architectes du récif',
    lieu: 'Près du fablab',
    indice: "En dessous de l'amphi 250.",
    photo: '/fresques/tortue.jpg',
    cadrage: 'center 78%',
    couleur: 'lagon',
    lat: -22.26237,
    lng: 166.40528,
    rayon: 18,
    nbFragments: 3,
    cibleAR: '/ar/tortue/targets.mind',
    cible: { x: 0.02, y: 0.308, w: 0.958, h: 0.525 },
    ancrages: [
      { u: 0.48, v: 0.18, vue: 'face' },
      { u: 0.27, v: 0.3, vue: 'gauche' },
      { u: 0.93, v: 0.69, vue: 'droite' },
    ],
    foyer: { u: 0.93, v: 0.69 },
    // The wall is very wide: the scales view opens on the turtle, not the middle.
    depart: { u: 0.3, v: 0.5 },
  },
]
