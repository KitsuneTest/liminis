// Configuration for the 3 murals on the trail.
// Technical fields are read by the store; nom, sousTitre, indice and couleur by the views.

// Map home: UNC Nouville campus, Nouméa. The map opens here and stays here
// until the visitor taps "Moi".
export const CENTRE_PARCOURS = { lat: -22.26889, lng: 166.41944, zoom: 16 }

// ⚠️ Mural positions are placeholders spread across the campus: walk the site
// and replace each pair with a real reading.
export const FRESQUES = [
  {
    id: 'fresque-1',
    nom: 'Fresque 1',
    sousTitre: 'Le seuil',
    indice: "Cherchez le mur qui prend la lumière du matin.",
    couleur: 'mousse',
    lat: -22.2678, // TODO: survey the real latitude
    lng: 166.4186, // TODO: survey the real longitude
    rayon: 25, // validation zone radius, in metres
    nbFragments: 4, // how many fragments to collect in AR
    cibleAR: '/ar/fresque-1/targets.mind',
  },
  {
    id: 'fresque-2',
    nom: 'Fresque 2',
    sousTitre: 'La lisière',
    indice: 'Au bout du passage, là où les arbres reprennent la main.',
    couleur: 'lagon',
    lat: -22.2695,
    lng: 166.4205,
    rayon: 25,
    nbFragments: 4,
    cibleAR: '/ar/fresque-2/targets.mind',
  },
  {
    id: 'fresque-3',
    nom: 'Fresque 3',
    sousTitre: 'La crue',
    indice: "Suivez l'eau : elle mène au dernier mur.",
    couleur: 'prune',
    lat: -22.2702,
    lng: 166.4178,
    rayon: 25,
    nbFragments: 4,
    cibleAR: '/ar/fresque-3/targets.mind',
  },
]
