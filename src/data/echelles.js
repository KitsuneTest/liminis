import { PALETTE } from '../lib/palette'

export const ECHELLES = {
  hibiscus: [
    {
      type: 'photo',
      nom: 'La fresque',
      taille: '5 m',
      texte: 'Le mur entier, vu en passant. Écartez deux doigts pour plonger vers la molécule peinte en bas à droite.',
    },
    {
      type: 'domes',
      nom: 'Le pétale',
      taille: '0,3 mm',
      texte: "De près, la surface du pétale n'est pas lisse : elle est couverte de petits dômes serrés.",
      couleur: PALETTE.terre,
      fond: '#7a2a0e',
    },
    {
      type: 'cellules',
      nom: 'La cellule',
      taille: '30 µm',
      texte: 'Chaque dôme est une cellule. Sa grande vacuole, remplie de pigment, donne au pétale sa couleur.',
      membrane: PALETTE.papier,
      interieur: PALETTE.terre,
      noyau: PALETTE.prune,
    },
    {
      type: 'molecule',
      molecule: 'cyanidine',
      nom: 'La cyanidine',
      taille: '1 nm',
      texte: "La molécule peinte sur la fresque. Selon l'acidité de la vacuole, elle vire du rouge au violet, puis au bleu.",
    },
  ],
  loriquet: [
    {
      type: 'photo',
      nom: 'La fresque',
      taille: '6 m',
      texte: 'Le loriquet en entier. Écartez deux doigts pour plonger vers la molécule peinte sous l’oiseau.',
    },
    {
      type: 'plume',
      nom: 'La plume',
      taille: '1 cm',
      texte: "Un axe central d'où partent des centaines de barbes, elles-mêmes garnies de barbules qui s'agrippent entre elles.",
      couleurs: [PALETTE.lagon, PALETTE.or, PALETTE.terre],
    },
    {
      type: 'grains',
      nom: 'La barbe',
      taille: '50 µm',
      texte: 'Dans la kératine de chaque barbe sont rangés des grains de pigment : les mélanosomes.',
      matrice: PALETTE.papier,
      grain: PALETTE.prune,
    },
    {
      type: 'molecule',
      molecule: 'eumelanine',
      nom: "L'eumélanine",
      taille: '1 nm',
      texte: 'La molécule peinte sur le mur : des motifs indole enchaînés. Elle absorbe la lumière et assombrit ou renforce les couleurs de la plume.',
    },
  ],
  tortue: [
    {
      type: 'photo',
      nom: 'La fresque',
      taille: '8 m',
      texte: 'La tortue et le récif. Écartez deux doigts pour plonger vers le panneau de molécules, à droite.',
    },
    {
      type: 'carapace',
      nom: 'La carapace',
      taille: '50 cm',
      texte: "L'os de la carapace est recouvert de grandes écailles : 5 au centre, 4 de chaque côté et une couronne sur le bord. Ce sont des plaques de protéines cornées.",
      couleurs: ['#8a5a2b', '#B39470', '#6e6a3a', '#a8743a'],
    },
    {
      type: 'cellules',
      nom: "Les cellules de l'écaille",
      taille: '20 µm',
      texte: "Ces plaques sont faites de cellules aplaties, gorgées de protéines cornées puis empilées en couches serrées. Mortes, elles ont perdu leur noyau.",
      membrane: PALETTE.papier,
      interieur: PALETTE.or,
      noyau: null,
      aplati: 0.45,
    },
    {
      type: 'molecule',
      molecule: 'feuilletBeta',
      nom: 'Le feuillet β',
      taille: '1 nm',
      texte: 'La structure peinte sur la fresque : des chaînes de protéine côte à côte, tenues par des liaisons hydrogène (en pointillés). C’est l’architecture de la kératine.',
    },
  ],
}
