<script setup lang="ts">
interface HistoryEntry {
  topic: string
  labelRu: string
  correct: number
  total: number
  completedAt: string
}

const { data } = await useFetch<{ history: HistoryEntry[] }>('/api/grammar-drill/history')
const history = computed(() => data.value?.history ?? [])

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold">
        История тестов
      </h1>
      <NuxtLink to="/grammar-practice" class="text-sm text-primary-500 hover:underline">
        ← Модули
      </NuxtLink>
    </div>

    <div v-if="history.length === 0" class="text-sm text-stone-400">
      Тестов пока нет — пройди первый в любой теме.
    </div>

    <div v-else class="flex flex-col gap-2">
      <NuxtLink
        v-for="(h, i) in history"
        :key="i"
        :to="`/grammar-practice/topic/${h.topic}`"
        class="flex items-center justify-between text-sm rounded-lg border border-stone-200 dark:border-stone-800 px-4 py-3 hover:border-primary-500 transition-colors"
      >
        <div>
          <div class="font-medium">
            {{ h.labelRu }}
          </div>
          <div class="text-xs text-stone-500 dark:text-stone-400">
            {{ formatDate(h.completedAt) }}
          </div>
        </div>
        <span
          class="text-xs shrink-0 rounded-full px-2 py-0.5"
          :class="h.correct / h.total >= 0.6
            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'"
        >
          {{ h.correct }}/{{ h.total }}
        </span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
