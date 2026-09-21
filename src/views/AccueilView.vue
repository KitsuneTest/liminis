<script setup>
import { computed } from 'vue'
import { useProgression, FRESQUES } from '../stores/progression'

const progression = useProgression()
const commence = computed(() => progression.nbTampons > 0)
</script>

<template>
  <section class="couverture">
    <div class="couverture__carnet">
      <div class="bandeau-washi"></div>

      <header class="entete">
        <p class="surtitre">Carnet de terrain</p>
        <h1 class="titre">Liminis</h1>
        <p class="sous-titre">Trois fresques, un parcours, un familier à trouver.</p>
      </header>

      <div class="vignette" aria-hidden="true">
        <span class="vignette__astre"></span>
        <span class="vignette__colline vignette__colline--loin"></span>
        <span class="vignette__colline vignette__colline--pres"></span>
        <span v-for="n in 3" :key="n" class="vignette__repere" :style="{ '--i': n }">{{ n }}</span>
      </div>

      <ol class="etapes">
        <li><b>Marchez</b> jusqu'à chaque fresque, la carte vous guide.</li>
        <li><b>Visez-la</b> avec la caméra pour récolter ses fragments.</li>
        <li><b>Complétez</b> le carnet : les trois tampons réveillent votre familier.</li>
      </ol>

      <div v-if="commence" class="reprise">
        <div class="jauge" :aria-label="`${progression.nbTampons} tampons sur ${FRESQUES.length}`">
          <div
            class="jauge__valeur"
            :style="{ width: (progression.nbTampons / FRESQUES.length) * 100 + '%' }"
          ></div>
        </div>
        <p class="legende">{{ progression.nbTampons }} tampon(s) sur {{ FRESQUES.length }}</p>
      </div>

      <RouterLink class="bouton bouton--bloc" to="/parcours">
        {{ commence ? 'Reprendre le parcours' : 'Commencer le parcours' }}
      </RouterLink>

      <RouterLink class="lien-discret" to="/a-propos">À propos du dispositif</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.couverture {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: calc(1.2rem + env(safe-area-inset-top, 0px)) 1rem
           calc(1.2rem + env(safe-area-inset-bottom, 0px));
}

.couverture__carnet {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.2rem;
  background: var(--papier-clair);
  border: 1px solid var(--ligne);
  border-radius: 26px;
  box-shadow: var(--ombre-3);
  /* Stitched spine of the notebook. */
  background-image:
    repeating-linear-gradient(
      to bottom,
      var(--kraft-fonce) 0 10px,
      transparent 10px 22px
    ),
    linear-gradient(to right, var(--papier-ombre) 0 14px, transparent 14px);
  background-size: 2px 100%, 100% 100%;
  background-position: 7px 0, 0 0;
  background-repeat: no-repeat;
  padding-left: 1.9rem;
}

.entete { text-align: center; }
.titre {
  font-size: clamp(2.6rem, 14vw, 3.6rem);
  letter-spacing: 0.02em;
  margin: 0.15rem 0 0.35rem;
}
.sous-titre { font-size: 0.93rem; color: var(--encre-douce); }

/* --- Illustrated vignette, pure CSS --- */
.vignette {
  position: relative;
  height: 148px;
  border-radius: var(--rayon-s);
  overflow: hidden;
  border: 1px solid var(--ligne);
  background: linear-gradient(180deg, #e7f0f1 0%, #f4ece0 62%, #ecdfc8 100%);
}
.vignette__astre {
  position: absolute;
  top: 18px;
  right: 26px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--or);
  opacity: 0.85;
  box-shadow: 0 0 0 10px rgba(217, 164, 65, 0.16);
}
.vignette__colline {
  position: absolute;
  bottom: -60px;
  border-radius: 50% 50% 0 0;
}
.vignette__colline--loin {
  left: -18%;
  width: 90%;
  height: 128px;
  background: #9fbf9c;
}
.vignette__colline--pres {
  right: -22%;
  width: 96%;
  height: 112px;
  background: var(--mousse);
}
.vignette__repere {
  position: absolute;
  bottom: calc(18px + var(--i) * 9px);
  left: calc(14% + (var(--i) - 1) * 30%);
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font: 700 0.75rem/1 var(--serif);
  color: var(--encre);
  background: var(--papier-clair);
  border: 1.5px solid var(--encre);
  box-shadow: var(--ombre-2);
}

/* --- Steps ----------------------------------------------------------------- */
.etapes {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: etape;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.etapes li {
  counter-increment: etape;
  position: relative;
  padding-left: 2rem;
  font-size: 0.88rem;
  color: var(--encre-douce);
}
/* Absolute: in flex the <b> became its own item and broke the text. */
.etapes li::before {
  content: counter(etape);
  position: absolute;
  left: 0;
  top: 0.1em;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font: 700 0.72rem/1 var(--sans);
  color: var(--papier-clair);
  background: var(--kraft-fonce);
}
.etapes b { color: var(--encre); }

.reprise { display: flex; flex-direction: column; gap: 0.35rem; }

.lien-discret {
  text-align: center;
  font-size: 0.8rem;
  color: var(--encre-pale);
  text-decoration: none;
  border-bottom: 1px dashed var(--ligne-forte);
  align-self: center;
  padding-bottom: 1px;
}
</style>
