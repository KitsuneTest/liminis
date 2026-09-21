// Configuration des 3 fresques du parcours.
// ⚠️ À REMPLIR par l'équipe : vraies coordonnées GPS + nombre réel de fragments.
export const FRESQUES = [
  {
    id: 'fresque-1',
    nom: 'Fresque 1',
    lat: 48.8566,        // TODO : relever la vraie latitude
    lng: 2.3522,         // TODO : relever la vraie longitude
    rayon: 25,           // rayon de la zone de validation, en mètres
    nbFragments: 4,      // nombre de fragments à collecter en AR
    cibleAR: '/ar/fresque-1/targets.mind',
  },
  {
    id: 'fresque-2',
    nom: 'Fresque 2',
    lat: 48.8570,
    lng: 2.3530,
    rayon: 25,
    nbFragments: 4,
    cibleAR: '/ar/fresque-2/targets.mind',
  },
  {
    id: 'fresque-3',
    nom: 'Fresque 3',
    lat: 48.8560,
    lng: 2.3515,
    rayon: 25,
    nbFragments: 4,
    cibleAR: '/ar/fresque-3/targets.mind',
  },
]
