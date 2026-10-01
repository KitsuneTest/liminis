<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../stores/progression'
import Icone from '../components/Icone.vue'

const route = useRoute()
const progression = useProgression()

const onglets = computed(() => [
  { name: 'tampons', libelle: 'Tampons', icone: 'image' },
  { name: 'fragments', libelle: 'Fragments', icone: 'image' },
  {
    name: 'familier',
    libelle: 'Familier',
    icone: 'cadenas',
    verrouille: !progression.pageFamilierDisponible,
  },
  { name: 'a-propos', libelle: 'À propos', icone: 'info' },
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
        <Icone :nom="o.icone" :taille="22" />
        <span class="tab__libelle">{{ o.libelle }}</span>
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
.carnet { flex: 1; display: flex; flex-direction: column; }

.tabs {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  position: relative;
  z-index: 1;
  margin-bottom: -1px;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  max-width: 96px;
  height: 52px;
  border-radius: 6px 6px 0 0;
  background: var(--kraft);
  color: var(--encre-douce);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.tab__libelle { font-size: 0.62rem; line-height: 1; }

.tab--actif {
  height: 60px;
  background: var(--papier);
  color: var(--encre);
}
.tab--verrouille { pointer-events: none; }

.carnet__page {
  flex: 1;
  background: var(--papier);
  border-radius: 0 14px 14px 14px;
  padding: 1.6rem clamp(1rem, 5vw, 2rem);
}

.onglet-enter-active,
.onglet-leave-active { transition: opacity 0.16s ease; }
.onglet-enter-from,
.onglet-leave-to { opacity: 0; }
</style>
