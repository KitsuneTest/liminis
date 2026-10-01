<script setup>
defineProps({
  nom: { type: String, required: true },
  taille: { type: [Number, String], default: 20 },
})
</script>

<template>
  <svg
    class="icone"
    :width="taille"
    :height="taille"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="nom === 'boussole'">
      <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" fill="var(--papier-clair)" stroke="none" />
    </template>
    <template v-else-if="nom === 'carnet'">
      <path d="M5 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5Z" fill="currentColor" />
      <circle cx="11" cy="10" r="2.2" fill="var(--papier-clair)" stroke="none" />
      <path d="M7.5 16c.6-1.8 2-2.7 3.5-2.7s2.9.9 3.5 2.7" stroke="var(--papier-clair)" stroke-width="1.6" />
      <path d="M21 7v2M21 11v2M21 15v2" />
    </template>
    <template v-else-if="nom === 'camera'">
      <path d="M3 8a2 2 0 0 1 2-2h2.5l1.7-2.5h5.6L16.5 6H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" fill="currentColor" />
      <circle cx="12" cy="13" r="3.6" fill="var(--papier-clair)" stroke="none" />
      <circle cx="12" cy="13" r="2" fill="currentColor" stroke="none" />
    </template>
    <path v-else-if="nom === 'loupe'" d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM16 16l5 5" stroke-width="2.6" />
    <template v-else-if="nom === 'image'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.8" />
      <path d="m21 15-5-5L5 21" />
    </template>
    <template v-else-if="nom === 'cadenas'">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </template>
    <template v-else-if="nom === 'info'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </template>
    <template v-else-if="nom === 'oeil'">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </template>
    <template v-else-if="nom === 'tampon'">
      <path d="M9 3h6l-1 7h-4Z" />
      <path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4Z" />
      <path d="M5 21h14" />
    </template>
    <template v-else-if="nom === 'musique'">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" fill="currentColor" />
      <circle cx="18" cy="16" r="3" fill="currentColor" />
    </template>
    <template v-else-if="nom === 'musique-coupee'">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="m3 3 18 18" />
    </template>
    <path
      v-else-if="nom === 'etoile'"
      d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"
      fill="currentColor"
    />
    <template v-else-if="nom === 'repere'">
      <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" fill="currentColor" />
      <circle cx="12" cy="10" r="2.5" fill="var(--papier)" stroke="none" />
    </template>
    <path v-else-if="nom === 'chevron-haut'" d="m6 15 6-6 6 6" />
    <path v-else-if="nom === 'chevron-bas'" d="m6 9 6 6 6-6" />
    <path v-else-if="nom === 'chevron-gauche'" d="m15 6-6 6 6 6" />
  </svg>
</template>

<style scoped>
.icone { display: block; flex: none; }
</style>
