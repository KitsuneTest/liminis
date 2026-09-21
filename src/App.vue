<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const barreVisible = computed(() => route.name !== 'accueil')
const plein = computed(() => route.name === 'accueil' || route.meta.plein === true)

const ONGLETS = [
  { to: '/parcours', libelle: 'Explorer', glyphe: '◈' },
  { to: '/carnet', libelle: 'Carnet', glyphe: '❑' },
  { to: '/scanner', libelle: 'Scanner', glyphe: '◎' },
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
      <RouterLink v-for="o in ONGLETS" :key="o.to" :to="o.to" class="onglet">
        <span class="onglet__pastille">
          <span class="onglet__glyphe" aria-hidden="true">{{ o.glyphe }}</span>
        </span>
        <span class="onglet__libelle">{{ o.libelle }}</span>
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
  display: flex;
  justify-content: space-around;
  gap: 0.25rem;
  padding: 0.5rem 0.9rem calc(0.5rem + env(safe-area-inset-bottom, 0px));
  background: color-mix(in srgb, var(--papier-clair) 80%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  backdrop-filter: blur(20px) saturate(1.5);
  border-top: 1px solid var(--ligne);
}
@supports not (backdrop-filter: blur(1px)) {
  .barre-nav { background: var(--papier-clair); }
}

.onglet {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0.2rem;
  text-decoration: none;
  color: var(--encre-pale);
  transition: color 0.25s var(--doux);
  -webkit-tap-highlight-color: transparent;
}

.onglet__pastille {
  display: grid;
  place-items: center;
  width: 46px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: background 0.25s var(--doux), border-color 0.25s var(--doux),
    transform 0.25s var(--ressort);
}
.onglet__glyphe { font-size: 1.05rem; line-height: 1; }
.onglet__libelle { font-size: 0.64rem; font-weight: 650; }

.onglet:active .onglet__pastille { transform: scale(0.9); }

.onglet.router-link-active { color: var(--encre); }
.onglet.router-link-active .onglet__pastille {
  background: var(--surface);
  border-color: var(--ligne-forte);
  box-shadow: var(--ombre-1);
}

.page-enter-active,
.page-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
