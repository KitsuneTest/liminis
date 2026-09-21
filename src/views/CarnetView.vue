<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression, FRESQUES } from '../stores/progression'

const route = useRoute()
const progression = useProgression()

const fragmentsCollectes = computed(() =>
  FRESQUES.reduce((n, f) => n + progression.fresques[f.id].fragments.length, 0)
)

const onglets = computed(() => [
  { name: 'tampons', libelle: 'Tampons', glyphe: '◉', badge: progression.nbTampons || null },
  { name: 'fragments', libelle: 'Fragments', glyphe: '✦', badge: fragmentsCollectes.value || null },
  {
    name: 'familier',
    libelle: 'Familier',
    glyphe: '❀',
    verrouille: !progression.pageFamilierDisponible,
  },
  { name: 'a-propos', libelle: 'À propos', glyphe: 'ⓘ' },
])

const actif = computed(() =>
  route.name === 'tampon-detail' ? 'tampons' : route.name
)
</script>

<template>
  <div class="carnet">
    <nav class="tabs" aria-label="Sections du carnet">
      <RouterLink
        v-for="o in onglets"
        :key="o.name"
        class="tab"
        :class="{ 'tab--actif': actif === o.name, 'tab--verrouille': o.verrouille }"
        :to="o.verrouille ? route.fullPath : { name: o.name }"
        :aria-disabled="o.verrouille || undefined"
      >
        <span class="tab__glyphe" aria-hidden="true">{{ o.verrouille ? '🔒' : o.glyphe }}</span>
        <span class="tab__libelle">{{ o.libelle }}</span>
        <span v-if="o.badge" class="tab__badge">{{ o.badge }}</span>
      </RouterLink>
    </nav>

    <div class="carnet__page">
      <RouterView v-slot="{ Component }">
        <Transition name="onglet" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.carnet { display: flex; flex-direction: column; }

.tabs {
  display: flex;
  gap: 0.25rem;
  align-items: flex-end;
  /* Sits on top of the page so the active tab reads as part of it. */
  position: relative;
  z-index: 1;
  margin-bottom: -1px;
}

.tab {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0.2rem 0.55rem;
  border: 1px solid var(--ligne);
  border-bottom: none;
  border-radius: var(--rayon-s) var(--rayon-s) 0 0;
  background: var(--papier-ombre);
  color: var(--encre-pale);
  text-decoration: none;
  transition: background 0.2s var(--doux), color 0.2s var(--doux), padding 0.2s var(--doux);
  -webkit-tap-highlight-color: transparent;
}
.tab__glyphe { font-size: 0.95rem; line-height: 1; }
.tab__libelle { font-size: 0.58rem; font-weight: 650; letter-spacing: 0.01em; }

.tab--actif {
  background: var(--surface);
  color: var(--encre);
  padding-top: 0.7rem;
  padding-bottom: 0.75rem;
  box-shadow: 0 -2px 6px -3px rgba(46, 40, 35, 0.25);
}

.tab--verrouille {
  opacity: 0.5;
  pointer-events: none;
}

.tab__badge {
  position: absolute;
  top: 3px;
  right: 6px;
  min-width: 15px;
  padding: 0 3px;
  border-radius: 999px;
  font-size: 0.55rem;
  font-weight: 700;
  line-height: 15px;
  color: var(--papier-clair);
  background: var(--terre);
}

.carnet__page {
  background: var(--surface);
  border: 1px solid var(--ligne);
  border-radius: 0 var(--rayon) var(--rayon) var(--rayon);
  box-shadow: var(--ombre-1);
  padding: 1.2rem 1.1rem 1.4rem;
  min-height: 60svh;
}

.onglet-enter-active,
.onglet-leave-active { transition: opacity 0.16s ease; }
.onglet-enter-from,
.onglet-leave-to { opacity: 0; }
</style>
