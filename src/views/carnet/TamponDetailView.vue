<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProgression } from '../../stores/progression'

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
        ‹
      </RouterLink>
      <div>
        <h1>{{ config.nom }}</h1>
        <p class="sous">{{ config.sousTitre }}</p>
      </div>
    </header>

    <img
      class="photo"
      :class="{ 'photo--voilee': !etat.tampon }"
      :src="config.photo"
      :style="{ objectPosition: config.cadrage }"
      :alt="`Fresque ${config.nom}`"
      decoding="async"
    />

    <p class="lieu"><span aria-hidden="true">◈</span> {{ config.lieu }}</p>

    <div class="titre-ligne">
      <h2>Ses fragments</h2>
      <span class="compte">{{ etat.fragments.length }}/{{ config.nbFragments }}</span>
    </div>

    <ul class="fragments">
      <li v-for="f in fragments" :key="f.id">
        <span class="jeton" :class="{ 'jeton--vide': !f.obtenu }">
          <span v-if="!f.obtenu" class="jeton__cadenas" aria-hidden="true">🔒</span>
        </span>
      </li>
    </ul>

    <p v-if="!etat.tampon" class="note">
      Il faut d'abord rejoindre la fresque : le tampon se pose sur place.
    </p>

    <div class="actions">
      <RouterLink class="bouton bouton--bloc" :to="`/fresque/${config.id}`">
        {{ etat.fragments.length ? 'Reprendre la recherche' : 'Chercher les fragments' }}
      </RouterLink>
      <RouterLink
        v-if="progression.fresqueComplete(config.id)"
        class="bouton bouton--secondaire bouton--bloc"
        :to="`/fresque/${config.id}/microscopique`"
      >
        Vision d'échelles
      </RouterLink>
    </div>
  </section>

  <section v-else>
    <h1>Fresque inconnue</h1>
    <p class="legende">Aucune fresque ne porte l'identifiant « {{ route.params.id }} ».</p>
    <RouterLink class="bouton bouton--secondaire" :to="{ name: 'tampons' }">
      Retour aux tampons
    </RouterLink>
  </section>
</template>

<style scoped>
.entete { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 1rem; }

.retour {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-top: 2px;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--encre);
  text-decoration: none;
  border-radius: 50%;
  transition: background 0.2s var(--doux);
}
.retour:active { background: var(--papier-ombre); }

.sous {
  font-size: 0.85rem;
  color: var(--teinte);
  font-weight: 600;
  margin-top: 2px;
}

.photo {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--rayon-s);
  border: 1px solid var(--ligne);
  display: block;
}
.photo--voilee { filter: grayscale(0.85) contrast(0.9); opacity: 0.55; }

.lieu {
  margin-top: 0.7rem;
  font-size: 0.82rem;
  color: var(--encre-douce);
}
.lieu span { color: var(--teinte); margin-right: 0.3rem; }

.titre-ligne {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 1.5rem;
}
.compte { font-size: 0.85rem; color: var(--encre-douce); }

.fragments {
  list-style: none;
  margin: 0.8rem 0 0;
  padding: 0;
  display: flex;
  gap: 0.8rem;
}

.jeton {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--teinte);
  box-shadow: var(--ombre-2);
}
.jeton--vide {
  background: transparent;
  border: 1.5px dashed var(--kraft-fonce);
  box-shadow: none;
}
.jeton__cadenas { font-size: 0.9rem; opacity: 0.55; }

.note {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--encre-pale);
}

.actions {
  margin-top: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
</style>
