<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icone from './components/Icone.vue'

const route = useRoute()
const barreVisible = computed(() => route.name !== 'accueil')
const plein = computed(() => route.name === 'accueil' || route.meta.plein === true)

const ONGLETS = [
  { to: '/parcours', libelle: 'Explorer', icone: 'boussole' },
  { to: '/carnet', libelle: 'Carnet', icone: 'carnet' },
  { to: '/scanner', libelle: 'Scanner', icone: 'camera', aussi: ['fresque-ar'] },
]
</script>

<template>
  <div class="app">
    <main class="app__contenu" :class="{ 'app__contenu--plein': plein }">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <nav v-if="barreVisible" class="barre-nav" aria-label="Navigation principale">
      <div class="pilule">
        <RouterLink
          v-for="o in ONGLETS"
          :key="o.to"
          :to="o.to"
          class="onglet"
          :class="{ 'router-link-active': o.aussi?.includes(route.name) }"
          :aria-label="o.libelle"
        >
          <Icone :nom="o.icone" :taille="26" />
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}

.app__contenu {
  flex: 1;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 1rem 1rem;
  display: flex;
  flex-direction: column;
}
.app__contenu--plein {
  padding: 0;
  max-width: none;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.app__contenu--plein > * { flex: 1; min-height: 0; }

.barre-nav {
  position: sticky;
  bottom: 0;
  z-index: 800;
  padding: 0.6rem 0.9rem calc(0.7rem + env(safe-area-inset-bottom, 0px));
  background: var(--papier-clair);
}

.pilule {
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 1.6rem;
  border-radius: 999px;
  border: 2px solid var(--kraft);
  background: var(--papier-clair);
}

.onglet {
  display: grid;
  place-items: center;
  width: 44px;
  height: 36px;
  color: var(--encre-pale);
  transition: color 0.2s var(--doux), transform 0.2s var(--ressort);
  -webkit-tap-highlight-color: transparent;
}
.onglet:active { transform: scale(0.9); }
.onglet.router-link-active { color: var(--encre); }

.page-enter-active,
.page-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
