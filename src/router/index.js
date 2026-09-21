import { createRouter, createWebHistory } from 'vue-router'
import { useProgression } from '../stores/progression'

const routes = [
  { path: '/', name: 'accueil', component: () => import('../views/AccueilView.vue') },
  { path: '/parcours', name: 'parcours', component: () => import('../views/ParcoursView.vue') },
  { path: '/carnet', name: 'carnet', component: () => import('../views/CarnetView.vue') },
  { path: '/fresque/:id', name: 'fresque-ar', component: () => import('../views/FresqueARView.vue') },
  {
    path: '/fresque/:id/microscopique',
    name: 'microscopique',
    component: () => import('../views/MicroscopiqueView.vue'),
    meta: { verrou: 'microscopique' },
  },
  { path: '/a-propos', name: 'a-propos', component: () => import('../views/AproposView.vue') },
  {
    path: '/familier',
    name: 'familier',
    component: () => import('../views/FamilierView.vue'),
    meta: { verrou: 'familier' },
  },
]

const router = createRouter({ history: createWebHistory(), routes })

// Verrouillage des pages selon la progression (lu depuis le store)
router.beforeEach((to) => {
  const p = useProgression()
  if (to.meta.verrou === 'familier' && !p.pageFamilierDisponible) return '/parcours'
  if (to.meta.verrou === 'microscopique' && !p.microscopiqueDebloquee(to.params.id))
    return `/fresque/${to.params.id}`
  return true
})

export default router
