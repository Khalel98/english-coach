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

const { data } = await useFetch<{ groups: GrammarTopicGroup[] }>('/api/grammar-drill/topics')
const groups = computed(() => data.value?.groups ?? [])

const totalAttempts = computed(() =>
  groups.value.reduce((sum, g) => sum + g.topics.reduce((s, t) => s + t.attempts, 0), 0),
)

const startingAuto = ref(false)

async function startAuto() {
  startingAuto.value = true
  try {
    const drill = await $fetch<{ topic: string }>('/api/grammar-drill/generate', { method: 'POST', body: {} })
    await navigateTo(`/grammar-practice/topic/${drill.topic}?autostart=1`)
  } finally {
    startingAuto.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-semibold">
        Грамматика
      </h1>
      <NuxtLink to="/grammar-practice/history" class="text-sm text-primary-500 hover:underline">
        История тестов{{ totalAttempts > 0 ? ` (${totalAttempts})` : '' }}
      </NuxtLink>
    </div>
    <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">
      Выбери модуль ниже, чтобы пройти темы по порядку — от основ до продвинутой грамматики. У каждой темы есть подробное объяснение с примерами и отдельный тест.
    </p>

    <div class="rounded-lg border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950/30 p-4 mb-8 flex items-center justify-between gap-4">
      <div>
        <div class="font-medium text-sm mb-0.5">
          Не знаешь, с чего начать?
        </div>
        <p class="text-xs text-stone-500 dark:text-stone-400">
          Система сама выберет твою самую слабую тему на основе прошлых ошибок.
        </p>
      </div>
      <UButton :loading="startingAuto" @click="startAuto">
        Слабая тема
      </UButton>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="g in groups"
        :key="g.category"
        :to="`/grammar-practice/category/${g.category}`"
        class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors"
      >
        <div class="font-medium mb-1">
          {{ g.categoryRu }}
        </div>
        <p class="text-xs text-stone-500 dark:text-stone-400">
          {{ g.topics.length }} {{ g.topics.length === 1 ? 'тема' : 'темы' }}
          <span v-if="g.topics.some(t => t.attempts > 0)">
            · пройдено {{ g.topics.filter(t => t.attempts > 0).length }} из {{ g.topics.length }}
          </span>
        </p>
      </NuxtLink>
    </div>
  </UContainer>
</template>
