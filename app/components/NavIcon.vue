<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0">
    <template v-if="name === 'home'">
      <polyline points="3,11 12,4 21,11" />
      <rect x="5" y="11" width="14" height="9" rx="1" />
    </template>
    <template v-else-if="name === 'chat'">
      <rect x="3" y="4" width="18" height="13" rx="3" />
      <polyline points="7,17 7,21 11,17" />
    </template>
    <template v-else-if="name === 'vocabulary'">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </template>
    <template v-else-if="name === 'grammar'">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <polyline points="8,12 11,15 16,9" />
    </template>
    <template v-else-if="name === 'scenarios'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12,12 15,7" />
      <polyline points="12,12 9,17" />
    </template>
    <template v-else-if="name === 'boss-battle'">
      <polygon points="12,3 20,12 12,21 4,12" />
      <polygon points="12,7.5 16,12 12,16.5 8,12" />
    </template>
    <template v-else-if="name === 'missions'">
      <line x1="6" y1="3" x2="6" y2="21" />
      <polyline points="6,4 18,4 15,8 18,12 6,12" />
    </template>
    <template v-else-if="name === 'placement-test'">
      <rect x="5" y="14" width="3" height="6" />
      <rect x="10.5" y="10" width="3" height="10" />
      <rect x="16" y="5" width="3" height="15" />
    </template>
    <template v-else-if="name === 'mistakes'">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'dna'">
      <polyline points="8,3 16,7 8,11 16,15 8,19" />
      <polyline points="16,3 8,7 16,11 8,15 16,19" />
    </template>
    <template v-else-if="name === 'menu'">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </template>
    <template v-else-if="name === 'close'">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </template>
  </svg>
</template>
