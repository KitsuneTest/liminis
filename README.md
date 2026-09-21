# Liminis — PWA

Dispositif interactif : l'utilisateur scanne un QR code, suit une carte jusqu'à
3 fresques, les explore en réalité augmentée pour collecter des fragments, et
complète un carnet exportable en PDF. Fonctionne **hors-ligne** après le premier
chargement, **sans compte ni application à installer**.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres commandes : `npm run build` (production), `npm run preview` (tester le build + le mode hors-ligne).

> Le service worker n'est actif qu'en build (`npm run build && npm run preview`), pas en `dev`.

## Tester sur téléphone

La caméra et le GPS exigent **HTTPS** (ou `localhost`). Pour tester sur mobile :

```bash
npm run dev -- --host     # puis ouvrir l'URL réseau depuis le téléphone
```

Si le navigateur bloque la caméra, déployer sur Netlify (HTTPS automatique) et tester depuis l'URL en ligne.

## Architecture

**Le store `src/stores/progression.js` est le hub central.** Toutes les pages
lisent et écrivent dedans ; aucune page ne parle directement à une autre.
Le store se sauvegarde tout seul dans IndexedDB (la progression survit au reload).

```
src/
├── main.js                 point d'entrée (hydrate le store avant d'afficher)
├── router/index.js         routes + verrouillage des pages selon la progression
├── stores/progression.js   ★ hub central (tampons, fragments, quiz, familier)
├── data/fresques.js        ⚠️ config des 3 fresques — À REMPLIR
├── composables/
│   └── useGeoloc.js        suivi GPS → validation de zone
├── components/
│   ├── CarteParcours.vue   carte Leaflet + marqueurs + position
│   └── ScanneurAR.vue      viseur caméra + fragments à collecter
└── views/                  une vue par page
```

Le style commun (papier, tampons, boutons, jauges) vit dans `src/style.css` :
réutiliser `.feuille`, `.bouton`, `.tampon`, `.puce` plutôt que redéfinir.

## Répartition du travail

Le parcours est jouable de bout en bout. Ce qui reste à approfondir :

| Brique | État | Reste à faire |
|---|---|---|
| Carte & parcours | ✅ `components/CarteParcours.vue` | tuiles hors-ligne (`leaflet.offline`) |
| Caméra | ✅ `components/ScanneurAR.vue` | suivi d'image MindAR — voir `public/ar/README.md` |
| Vision d'échelles | maquette dans `MicroscopiqueView.vue` | visuels réels + transitions GSAP |
| Quiz & familier | ✅ `FamilierView.vue` | illustrations des 3 familiers |
| Carnet | ✅ `CarnetView.vue` | export PDF (html2canvas + jsPDF) |

```bash
npm install mind-ar aframe        # suivi d'image AR
npm install gsap                  # vision d'échelles
npm install html2canvas jspdf     # export PDF
npm install leaflet.offline       # tuiles hors-ligne
```

## À faire en priorité

La liste complète — quoi produire, où le déposer, quelle ligne toucher — est
dans **[A_FAIRE.md](A_FAIRE.md)**. Les deux points bloquants :

1. Relever les **coordonnées GPS réelles** des 3 fresques → `src/data/fresques.js`
   (la carte est centrée sur le campus de Nouville, mais les 3 repères y sont
   placés approximativement)
2. Compiler les **cibles AR** (`.mind`) et **tester sur la vraie fresque** —
   c'est le principal risque du projet

## Conventions d'équipe

- Une branche par brique : `feat/carte`, `feat/ar`, `feat/vision`…
- Ne jamais modifier `stores/progression.js` sans prévenir (tout le monde en dépend).
- Commiter le `package-lock.json` (versions figées = mêmes versions pour tous).
