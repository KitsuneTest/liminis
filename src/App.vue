<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression, FRESQUES } from './stores/progression'

const progression = useProgression()
const route = useRoute()

// The home screen is a cover page: no nav bar on it.
const barreVisible = computed(() => route.name !== 'accueil')

const onglets = computed(() => [
  { to: '/parcours', libelle: 'Parcours', glyphe: '◈' },
  { to: '/carnet', libelle: 'Carnet', glyphe: '❑' },
  ...(progression.pageFamilierDisponible
    ? [{ to: '/familier', libelle: 'Familier', glyphe: '❀' }]
    : []),
  { to: '/a-propos', libelle: 'À propos', glyphe: '❋' },
])
</script>

<template>
  <div class="app">
    <main class="app__contenu" :class="{ 'app__contenu--plein': !barreVisible }">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <nav v-if="barreVisible" class="barre-nav" aria-label="Navigation principale">
      <RouterLink v-for="o in onglets" :key="o.to" :to="o.to" class="onglet">
        <span class="onglet__glyphe" aria-hidden="true">{{ o.glyphe }}</span>
        <span class="onglet__libelle">{{ o.libelle }}</span>
        <span
          v-if="o.to === '/carnet' && progression.nbTampons"
          class="onglet__pastille"
        >{{ progression.nbTampons }}/{{ FRESQUES.length }}</span>
      </RouterLink>
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
  padding: calc(1rem + env(safe-area-inset-top, 0px)) 1rem 1.5rem;
}
.app__contenu--plein { padding: 0; max-width: none; }

/* --- Nav bar: frosted, floating above the page ----------------------------- */
.barre-nav {
  position: sticky;
  bottom: 0;
  z-index: 800;
  display: flex;
  justify-content: space-around;
  gap: 0.25rem;
  padding: 0.45rem 0.6rem calc(0.45rem + env(safe-area-inset-bottom, 0px));
  background: color-mix(in srgb, var(--papier-clair) 78%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  backdrop-filter: blur(20px) saturate(1.5);
  border-top: 1px solid var(--ligne);
}
/* Browsers without backdrop-filter get a solid bar rather than a see-through one. */
@supports not (backdrop-filter: blur(1px)) {
  .barre-nav { background: var(--papier-clair); }
}

.onglet {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 48px;
  padding: 0.35rem 0.2rem;
  border-radius: var(--rayon-s);
  text-decoration: none;
  color: var(--encre-pale);
  transition: color 0.25s var(--doux), transform 0.25s var(--ressort);
  -webkit-tap-highlight-color: transparent;
}
.onglet:active { transform: scale(0.94); }

.onglet__glyphe { font-size: 1.1rem; line-height: 1; }
.onglet__libelle { font-size: 0.65rem; font-weight: 650; letter-spacing: 0.02em; }

.onglet.router-link-active { color: var(--encre); }
/* A small bar above the active tab instead of a filled box. */
.onglet.router-link-active::after {
  content: '';
  position: absolute;
  top: 0;
  width: 22px;
  height: 3px;
  border-radius: 999px;
  background: var(--terre);
}

/* Offset down so it clears the active-tab indicator bar. */
.onglet__pastille {
  position: absolute;
  top: 6px;
  right: 50%;
  transform: translateX(26px);
  font-size: 0.56rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  color: var(--papier-clair);
  background: var(--terre);
}

/* --- Page transition ------------------------------------------------------- */
.page-enter-active,
.page-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
