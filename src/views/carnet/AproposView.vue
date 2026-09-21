<script setup>
import { ref } from 'vue'
import { useProgression } from '../../stores/progression'

const progression = useProgression()
const confirme = ref(false)

async function reinitialiser() {
  await progression.reinitialiser()
  confirme.value = false
}
</script>

<template>
  <section class="pile">
    <header>
      <p class="surtitre">Colophon</p>
      <h1 class="titre-chapitre">À propos</h1>
    </header>

    <div class="feuille feuille--cousue">
      <p>
        <b>Liminis</b> est un parcours de trois fresques à explorer sur place :
        la carte vous y mène, la caméra en révèle les fragments, le carnet garde
        la trace.
      </p>
      <hr class="separateur" />
      <p class="legende">
        Aucun compte, aucune installation, aucun serveur : la progression reste
        sur votre appareil et le parcours fonctionne hors-ligne une fois la page
        chargée.
      </p>
    </div>

    <div class="feuille feuille--teintee">
      <p class="surtitre">Autorisations utilisées</p>
      <ul class="liste">
        <li><b>Position</b> — poser le tampon quand vous entrez dans une zone.</li>
        <li><b>Caméra</b> — afficher la fresque et ses fragments.</li>
      </ul>
      <p class="legende">
        Les deux exigent une connexion <code>https://</code>. Rien n'est envoyé
        ni enregistré ailleurs que sur cet appareil.
      </p>
    </div>

    <div class="feuille zone-risque">
      <p class="surtitre">Réinitialiser</p>
      <p class="legende">
        Efface tampons, fragments, quiz et familier. Irréversible.
      </p>
      <button
        v-if="!confirme"
        class="bouton bouton--petit bouton--secondaire"
        type="button"
        @click="confirme = true"
      >Effacer ma progression</button>
      <div v-else class="confirmation">
        <button class="bouton bouton--petit bouton--accent" type="button" @click="reinitialiser">
          Confirmer l'effacement
        </button>
        <button class="bouton bouton--petit bouton--secondaire" type="button" @click="confirme = false">
          Annuler
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.liste {
  margin: 0.4rem 0 0.7rem;
  padding-left: 1.1rem;
  font-size: 0.9rem;
  color: var(--encre-douce);
}
.liste li { margin-bottom: 0.25rem; }
.liste b { color: var(--encre); }

code {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.82em;
  background: var(--papier-ombre);
  padding: 1px 4px;
  border-radius: 4px;
}

.zone-risque {
  border-color: color-mix(in srgb, var(--rouge-tampon) 40%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  align-items: flex-start;
}
.confirmation { display: flex; gap: 0.5rem; flex-wrap: wrap; }
</style>
