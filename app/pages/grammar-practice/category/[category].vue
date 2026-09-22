<script setup lang="ts">
interface GrammarTopicSummary {
  topic: string
  labelRu: string
  attempts: number
  lastScore: { correct: number; total: number } | null
  lastAttemptAt: string | null
}

interface GrammarTopicGroup {
  category: string
  categoryRu: string
  topics: GrammarTopicSummary[]
}

const route = useRoute()
const categorySlug = route.params.category as string

const { data } = await useFetch<{ groups: GrammarTopicGroup[] }>('/api/grammar-drill/topics')
const group = computed(() => data.value?.groups.find(g => g.category === categorySlug))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold">
        {{ group?.categoryRu ?? 'Модуль' }}
      </h1>
      <NuxtLink to="/grammar-practice" class="text-sm text-primary-500 hover:underline">
        ← Все модули
      </NuxtLink>
    </div>

    <div v-if="!group" class="text-sm text-stone-400">
      Модуль не найден.
    </div>

    <div v-else class="flex flex-col gap-3">
      <NuxtLink
        v-for="t in group.topics"
        :key="t.topic"
        :to="`/grammar-practice/topic/${t.topic}`"
        class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="font-medium">{{ t.labelRu }}</span>
          <span v-if="t.lastScore" class="text-xs shrink-0 rounded-full px-2 py-0.5"
            :class="t.lastScore.correct / t.lastScore.total >= 0.6
              ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'"
          >
            {{ t.lastScore.correct }}/{{ t.lastScore.total }}
          </span>
          <span v-else class="text-xs shrink-0 text-stone-400">
            не пройдено
          </span>
        </div>
        <p v-if="t.attempts > 0" class="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {{ t.attempts }} {{ t.attempts === 1 ? 'попытка' : 'попыток' }}, последняя — {{ formatDate(t.lastAttemptAt!) }}
        </p>
      </NuxtLink>
    </div>
  </UContainer>
</template>
