import { distanceMetres } from '../stores/progression'

export function distanceA(fresque, position) {
  return position ? distanceMetres(position, fresque) : null
}

export function etatMarqueur(fresque, etat, position) {
  if (etat?.tampon) return 'tampon'
  const d = distanceA(fresque, position)
  if (d !== null && d <= fresque.rayon) return 'oeil'
  return 'cadenas'
}

export function libelleDistance(fresque, position) {
  const d = distanceA(fresque, position)
  if (d === null) return 'position inconnue'
  if (d <= fresque.rayon) return 'tout près'
  return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`
}

export function libelleEtat(fresque, etat) {
  if ((etat?.fragments.length ?? 0) >= fresque.nbFragments) return 'complété'
  if (etat?.tampon) return 'visité'
  return 'pas encore visité'
}
