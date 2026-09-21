// Configuration for the 3 murals on the trail.
// Technical fields are read by the store; the rest by the views.

// Campus de Nouville, framed on the three murals rather than on the whole site.
export const CENTRE_PARCOURS = { lat: -22.26281, lng: 166.40398, zoom: 17 }

// Positions derived from the OSM landmarks named in `lieu` (BU, restaurant
// universitaire, bâtiment S). ⚠️ Still to confirm wall by wall on site.
export const FRESQUES = [
  {
    id: 'hibiscus',
    nom: 'Hibiscus',
    sousTitre: 'La chimie des couleurs',
    lieu: 'BU · Terrasse Sisters Food',
    indice: 'Sous la coursive, le long de la terrasse en bois.',
    photo: '/fresques/hibiscus.jpg',
    cadrage: 'center 58%',
    couleur: 'terre',
    teinteCible: [330, 30], // warm reds, wrapping past 0°
    lat: -22.26268,
    lng: 166.40458,
    rayon: 18,
    nbFragments: 3,
    cibleAR: '/ar/hibiscus/targets.mind',
  },
  {
    id: 'loriquet',
    nom: 'Loriquet',
    sousTitre: 'Le langage des plumes',
    lieu: 'Terrasse de la BU',
    indice: "À l'entrée du patio, contre la baie vitrée.",
    photo: '/fresques/loriquet.jpg',
    couleur: 'mousse',
    teinteCible: [75, 155], // foliage greens
    lat: -22.2629,
    lng: 166.4048,
    rayon: 18,
    nbFragments: 3,
    cibleAR: '/ar/loriquet/targets.mind',
  },
  {
    id: 'tortue',
    nom: 'Tortue marine',
    sousTitre: 'Les architectes du récif',
    lieu: 'Près du fablab',
    indice: 'Sur le mur en contrebas, côté bâtiment S.',
    photo: '/fresques/tortue.jpg',
    cadrage: 'center 78%',
    couleur: 'lagon',
    teinteCible: [185, 235], // lagoon blues
    lat: -22.26293,
    lng: 166.40316,
    rayon: 18,
    nbFragments: 3,
    cibleAR: '/ar/tortue/targets.mind',
  },
]
