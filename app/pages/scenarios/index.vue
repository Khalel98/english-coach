<script setup lang="ts">
import { SCENARIO_CATEGORY_LABEL, DIFFICULTY_LABEL } from '../../utils/labels'

interface ScenarioListItem {
  id: string
  category: string
  titleRu: string
  objectiveRu: string
  difficulty: string
}

const { data } = await useFetch<{ scenarios: ScenarioListItem[] }>('/api/scenarios')

const grouped = computed(() => {
  const scenarios = data.value?.scenarios ?? []
  const groups = new Map<string, ScenarioListItem[]>()
  for (const s of scenarios) {
    if (!groups.has(s.category)) groups.set(s.category, [])
    groups.get(s.category)!.push(s)
  }
  return groups
})
</script>

<template>
  <UContainer class="py-8 max-w-3xl">
    <h1 class="text-xl font-semibold mb-6">
      Сценарии
    </h1>

    <div v-for="[category, scenarios] in grouped" :key="category" class="mb-8">
      <h2 class="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wide">
        {{ SCENARIO_CATEGORY_LABEL[category] ?? category }}
      </h2>

      <div class="grid gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="s in scenarios"
          :key="s.id"
          :to="`/scenarios/${s.id}`"
          class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="font-medium">{{ s.titleRu }}</span>
            <span class="text-xs text-stone-400">{{ DIFFICULTY_LABEL[s.difficulty] ?? s.difficulty }}</span>
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            {{ s.objectiveRu }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </UContainer>
</template>
