<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../../stores/progression'
import Icone from '../../components/Icone.vue'

const route = useRoute()
const progression = useProgression()

const config = computed(() => progression.fresqueConfig(route.params.id))
const etat = computed(
  () => progression.fresques[route.params.id] ?? { tampon: false, fragments: [] }
)

const fragments = computed(() =>
  Array.from({ length: config.value?.nbFragments ?? 0 }, (_, i) => {
    const id = `frag-${i + 1}`
    return { id, obtenu: etat.value.fragments.includes(id) }
  })
)
</script>

<template>
  <section v-if="config" :style="{ '--teinte': `var(--${config.couleur})` }">
    <header class="entete">
      <RouterLink class="retour" :to="{ name: 'tampons' }" aria-label="Retour aux tampons">
        <Icone nom="chevron-gauche" :taille="22" />
      </RouterLink>
      <h1>{{ config.nom }}</h1>
    </header>
    <p class="sous">{{ config.sousTitre }}</p>

    <img
      class="photo"
      :class="{ 'photo--voilee': !etat.tampon }"
      :src="config.photo"
      :style="{ objectPosition: config.cadrage }"
      :alt="`Fresque ${config.nom}`"
      decoding="async"
    />

    <p class="lieu"><Icone nom="repere" :taille="16" /> {{ config.lieu }}</p>

    <div class="titre-ligne">
      <h2>Ses fragments</h2>
      <span class="compte">{{ etat.fragments.length }}/{{ config.nbFragments }}</span>
    </div>

    <ul class="fragments">
      <li v-for="f in fragments" :key="f.id">
        <span class="jeton" :class="{ 'jeton--vide': !f.obtenu }">
          <Icone v-if="!f.obtenu" nom="cadenas" :taille="14" />
        </span>
      </li>
    </ul>
  </section>

  <section v-else>
    <h1>Fresque inconnue</h1>
    <p class="legende">Aucune fresque ne porte l'identifiant « {{ route.params.id }} ».</p>
  </section>
</template>

<style scoped>
.entete { display: flex; align-items: center; gap: 0.5rem; }

.retour {
  display: grid;
  place-items: center;
  margin-left: -6px;
  color: var(--encre);
}

.sous {
  margin: 0.5rem 0 1.4rem 2.1rem;
  font-size: 0.82rem;
  color: var(--encre);
}

.photo {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 8px;
  background: var(--kraft);
}
.photo--voilee { filter: grayscale(0.7); }

.lieu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.7rem;
  color: var(--encre);
}

.titre-ligne {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 1.8rem;
}
.titre-ligne h2 { font-size: 1.15rem; }
.compte { font-size: 0.78rem; color: var(--encre); }

.fragments {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 96px));
  gap: clamp(0.7rem, 4vw, 1.4rem);
}

.jeton {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--teinte);
}
.jeton--vide {
  background: transparent;
  border: 1.5px dotted var(--encre-pale);
  color: var(--encre-pale);
}
</style>
