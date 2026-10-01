<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProgression, FRESQUES } from '../stores/progression'
import { useGeoloc } from '../composables/useGeoloc'
import { distanceA, libelleDistance, libelleEtat } from '../lib/statutFresque'
import CarteParcours from '../components/CarteParcours.vue'
import Icone from '../components/Icone.vue'

const router = useRouter()
const progression = useProgression()
const { demarrer, position, erreur } = useGeoloc()

const annonce = ref('')
const choixManuel = ref(null)
const ouvert = ref(false)
const musique = ref(false)
let audio = null

onMounted(() => {
  demarrer((fresqueId) => {
    const f = FRESQUES.find((x) => x.id === fresqueId)
    annonce.value = `Tampon obtenu : ${f?.nom ?? fresqueId}`
    setTimeout(() => { annonce.value = '' }, 6000)
  })
})

onBeforeUnmount(() => audio?.pause())

const segments = computed(() => {
  const remplis = FRESQUES.flatMap((f) =>
    progression.fresques[f.id].fragments.map(() => `var(--${f.couleur})`)
  )
  const total = FRESQUES.reduce((n, f) => n + f.nbFragments, 0)
  return [...remplis, ...Array(total - remplis.length).fill(null)]
})

const choisie = computed(() => {
  if (choixManuel.value) return FRESQUES.find((f) => f.id === choixManuel.value)
  if (!position.value) return FRESQUES[0]
  return [...FRESQUES].sort((a, b) => distanceA(a, position.value) - distanceA(b, position.value))[0]
})

const etat = computed(() => progression.fresques[choisie.value.id])
const complete = computed(() => progression.fresqueComplete(choisie.value.id))
const statutLigne = computed(
  () => `${libelleDistance(choisie.value, position.value)} · ${libelleEtat(choisie.value, etat.value)}`
)

function choisir(id) {
  choixManuel.value = id
  ouvert.value = true
}

function basculerMusique() {
  audio ??= Object.assign(new Audio('/son/ambiance.mp3'), { loop: true, volume: 0.5 })
  if (musique.value) {
    audio.pause()
    musique.value = false
    return
  }
  audio.play().then(() => (musique.value = true)).catch(() => (musique.value = false))
}
</script>

<template>
  <div class="explorer">
    <div class="explorer__carte">
      <CarteParcours
        :fresques="FRESQUES"
        :etats="progression.fresques"
        :position="position"
        :selection="choisie.id"
        @choisir="choisir"
      />

      <div class="haut">
        <div class="recolte" :aria-label="`${segments.filter(Boolean).length} fragments récoltés`">
          <Icone class="recolte__etoile" nom="etoile" :taille="30" />
          <span class="recolte__barre">
            <i
              v-for="(c, i) in segments"
              :key="i"
              :class="{ plein: c }"
              :style="c ? { background: c } : null"
            ></i>
          </span>
        </div>

        <button
          class="rond"
          type="button"
          :aria-pressed="musique"
          :aria-label="musique ? 'Couper la musique' : 'Lancer la musique'"
          @click="basculerMusique"
        >
          <Icone :nom="musique ? 'musique' : 'musique-coupee'" :taille="18" />
        </button>
      </div>

      <Transition name="surgir">
        <p v-if="annonce" class="toast toast--ok" role="status">✓ {{ annonce }}</p>
        <p v-else-if="erreur" class="toast" role="status">{{ erreur }}</p>
      </Transition>
    </div>

    <section class="feuillet" :class="{ 'feuillet--ouvert': ouvert }">
      <button class="feuillet__tete" type="button" :aria-expanded="ouvert" @click="ouvert = !ouvert">
        <img
          class="feuillet__vignette"
          :class="{ 'feuillet__vignette--grise': !complete }"
          :src="choisie.photo"
          :style="{ objectPosition: choisie.cadrage }"
          alt=""
        />
        <span class="feuillet__texte">
          <span class="feuillet__nom">{{ choisie.nomCourt }}</span>
          <span class="feuillet__statut">{{ statutLigne }}</span>
        </span>
        <Icone :nom="ouvert ? 'chevron-bas' : 'chevron-haut'" :taille="20" />
      </button>

      <div v-if="ouvert" class="feuillet__corps">
        <RouterLink
          v-if="!complete"
          class="loupe"
          :to="`/fresque/${choisie.id}`"
        >
          <Icone nom="loupe" :taille="18" />
          observer à la loupe
        </RouterLink>
        <span v-else class="loupe loupe--inactive" aria-disabled="true">
          <Icone nom="loupe" :taille="18" />
          observer à la loupe
        </span>
        <p class="feuillet__compte">
          {{ etat.fragments.length }} fragments sur {{ choisie.nbFragments }} récolté ici
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.explorer {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--papier-clair);
}

.explorer__carte {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
}
.explorer__carte > :first-child { flex: 1; }

.haut {
  position: absolute;
  top: calc(14px + env(safe-area-inset-top, 0px));
  left: 18px;
  right: 14px;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  pointer-events: none;
}
.haut > * { pointer-events: auto; }

.recolte {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 200px;
}
.recolte__etoile {
  position: relative;
  z-index: 1;
  color: var(--encre);
  margin-right: -10px;
}
.recolte__barre {
  flex: 1;
  display: flex;
  height: 14px;
  border-radius: 0 999px 999px 0;
  overflow: hidden;
  background: var(--kraft);
}
.recolte__barre i {
  flex: 1;
  border-right: 1.5px solid var(--papier);
  background: var(--kraft);
}
.recolte__barre i:last-child { border-right: 0; }

.rond {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--encre);
  background: color-mix(in srgb, var(--papier-clair) 70%, transparent);
  color: var(--encre);
  cursor: pointer;
}

.toast {
  position: absolute;
  top: calc(56px + env(safe-area-inset-top, 0px));
  left: 18px;
  right: 18px;
  z-index: 600;
  padding: 0.45rem 0.8rem;
  border-radius: var(--rayon-xs);
  font: 400 0.7rem/1.4 var(--mono);
  color: var(--encre);
  background: var(--papier-clair);
  border: 1px solid var(--kraft);
}
.toast--ok { color: var(--vert-valide); border-color: var(--vert-valide); }

.feuillet {
  position: relative;
  z-index: 700;
  padding: 1rem 1.4rem 0.9rem;
  background: var(--papier-clair);
}

.feuillet__tete {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--encre);
  text-align: left;
  cursor: pointer;
}

.feuillet__vignette {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--kraft);
}
.feuillet__vignette--grise { filter: grayscale(0.7); }

.feuillet__texte { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.feuillet__nom {
  font: 700 0.72rem/1 var(--mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.feuillet__statut {
  font: 400 0.6rem/1.2 var(--mono);
  color: var(--encre);
  text-transform: capitalize;
}
.feuillet--ouvert .feuillet__statut {
  color: var(--encre-pale);
  text-transform: none;
}

.feuillet__corps {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.65rem;
  margin-top: 1.1rem;
}

.loupe {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 46px;
  border-radius: 999px;
  font: 600 0.84rem/1 var(--sans);
  text-decoration: none;
  color: var(--papier-clair);
  background: var(--encre);
}
.loupe--inactive { background: var(--kraft); color: var(--papier-clair); }

.feuillet__compte {
  text-align: center;
  font: 400 0.6rem/1 var(--mono);
  color: var(--encre-pale);
}

.surgir-enter-active,
.surgir-leave-active { transition: opacity 0.3s var(--doux), transform 0.3s var(--ressort); }
.surgir-enter-from,
.surgir-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
