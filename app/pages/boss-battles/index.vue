<script setup lang="ts">
interface BossBattleListItem {
  id: string
  titleRu: string
  descriptionRu: string
}

const { data } = await useFetch<{ bossBattles: BossBattleListItem[] }>('/api/boss-battles')
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-6">
      Boss Battle
    </h1>

    <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">
      Комплексная проверка без подсказок — без исправлений, без помощи. Узнай, где ты реально находишься.
    </p>

    <div class="grid gap-3">
      <NuxtLink
        v-for="b in data?.bossBattles ?? []"
        :key="b.id"
        :to="`/boss-battles/${b.id}`"
        class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors"
      >
        <div class="font-medium mb-1">
          🗡️ {{ b.titleRu }}
        </div>
        <p class="text-sm text-stone-500 dark:text-stone-400">
          {{ b.descriptionRu }}
        </p>
      </NuxtLink>
    </div>
  </UContainer>
</template>
