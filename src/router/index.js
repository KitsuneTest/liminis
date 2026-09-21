import { createRouter, createWebHistory } from 'vue-router'
import { useProgression } from '../stores/progression'

const routes = [
  { path: '/', name: 'accueil', component: () => import('../views/AccueilView.vue') },
  {
    path: '/parcours',
    name: 'parcours',
    component: () => import('../views/ParcoursView.vue'),
    meta: { plein: true },
  },
  { path: '/scanner', name: 'scanner', component: () => import('../views/ScannerView.vue') },
  {
    path: '/carnet',
    component: () => import('../views/CarnetView.vue'),
    children: [
      { path: '', redirect: { name: 'tampons' } },
      { path: 'tampons', name: 'tampons', component: () => import('../views/carnet/TamponsView.vue') },
      {
        path: 'tampons/:id',
        name: 'tampon-detail',
        component: () => import('../views/carnet/TamponDetailView.vue'),
      },
      {
        path: 'fragments',
        name: 'fragments',
        component: () => import('../views/carnet/FragmentsView.vue'),
      },
      {
        path: 'familier',
        name: 'familier',
        component: () => import('../views/carnet/FamilierView.vue'),
        meta: { verrou: 'familier' },
      },
      {
        path: 'a-propos',
        name: 'a-propos',
        component: () => import('../views/carnet/AproposView.vue'),
      },
    ],
  },
  { path: '/fresque/:id', name: 'fresque-ar', component: () => import('../views/FresqueARView.vue') },
  {
    path: '/fresque/:id/microscopique',
    name: 'microscopique',
    component: () => import('../views/MicroscopiqueView.vue'),
    meta: { verrou: 'microscopique' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})

router.beforeEach(async (to) => {
  const p = useProgression()

  // The first navigation starts at `app.use(router)`, before IndexedDB has
  // been read: without this wait a locked page bounces back to the trail.
  await p.pret()

  if (to.meta.verrou === 'familier' && !p.pageFamilierDisponible)
    return { name: 'tampons' }
  if (to.meta.verrou === 'microscopique' && !p.microscopiqueDebloquee(to.params.id))
    return `/fresque/${to.params.id}`
  return true
})

export default router
