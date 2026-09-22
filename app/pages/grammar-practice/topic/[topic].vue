<script setup lang="ts">
import type { GrammarDrillView } from '../../../../shared/types'

interface TopicDetail {
  topic: string
  labelRu: string
  category: string
  categoryRu: string
  explanationRu: string
  history: { correct: number; total: number; completedAt: string }[]
}

type Phase = 'lesson' | 'loading' | 'drill' | 'result'

const route = useRoute()
const topic = route.params.topic as string

const { data, refresh } = await useFetch<TopicDetail>(`/api/grammar-drill/topic/${topic}`)

const phase = ref<Phase>('lesson')
const drill = ref<GrammarDrillView | null>(null)
const answers = ref<(number | null)[]>([])
const score = ref<{ correct: number; total: number } | null>(null)

const explanationParagraphs = computed(() => (data.value?.explanationRu ?? '').split(/\n{2,}/).filter(Boolean))

async function startDrill() {
  phase.value = 'loading'
  drill.value = await $fetch<GrammarDrillView>('/api/grammar-drill/generate', {
    method: 'POST',
    body: { topic },
  })
  answers.value = drill.value.questions.map(() => null)
  phase.value = 'drill'
}

const allAnswered = computed(() => answers.value.every(a => a !== null))

async function submitDrill() {
  if (!drill.value || !allAnswered.value) return
  const correct = drill.value.questions.filter((q, i) => answers.value[i] === q.correctIndex).length
  const total = drill.value.questions.length
  score.value = { correct, total }
  phase.value = 'result'
  await $fetch('/api/grammar-drill/submit', {
    method: 'POST',
    body: { topic, correct, total },
  })
  await refresh()
}

function tryAgain() {
  phase.value = 'lesson'
  drill.value = null
  score.value = null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  if (route.query.autostart === '1') startDrill()
})
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-semibold">
        {{ data?.labelRu ?? 'Тема' }}
      </h1>
      <NuxtLink :to="data ? `/grammar-practice/category/${data.category}` : '/grammar-practice'" class="text-sm text-primary-500 hover:underline">
        ← Назад
      </NuxtLink>
    </div>
    <p v-if="data" class="text-xs text-stone-400 uppercase tracking-wide mb-6">
      {{ data.categoryRu }}
    </p>

    <template v-if="phase === 'lesson'">
      <div class="rounded-lg border border-stone-200 dark:border-stone-800 p-5 mb-6">
        <p v-if="!data" class="text-sm text-stone-400">
          Готовим объяснение…
        </p>
        <p v-for="(para, pi) in explanationParagraphs" :key="pi" class="text-sm text-stone-600 dark:text-stone-300 mb-3 last:mb-0 whitespace-pre-line">
          {{ para }}
        </p>
      </div>

      <UButton :disabled="!data" @click="startDrill">
        Пройти тест
      </UButton>

      <div v-if="data && data.history.length > 0" class="mt-8">
        <h2 class="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3">
          Предыдущие попытки
        </h2>
        <div class="flex flex-col gap-2">
          <div
            v-for="(h, i) in data.history"
            :key="i"
            class="flex items-center justify-between text-sm rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-2"
          >
            <span class="text-stone-500 dark:text-stone-400">{{ formatDate(h.completedAt) }}</span>
            <span
              class="text-xs rounded-full px-2 py-0.5"
              :class="h.correct / h.total >= 0.6
                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'"
            >
              {{ h.correct }}/{{ h.total }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="phase === 'loading'" class="text-sm text-stone-400">
      Готовим упражнения…
    </div>

    <template v-else-if="phase === 'drill' && drill">
      <div v-for="(q, qi) in drill.questions" :key="qi" class="rounded-lg border border-stone-200 dark:border-stone-800 p-4 mb-3">
        <p class="font-medium mb-3">
          {{ qi + 1 }}. {{ q.prompt }}
        </p>
        <div class="flex flex-col gap-2">
          <button
            v-for="(opt, oi) in q.options"
            :key="oi"
            class="text-left rounded-lg border px-3 py-1.5 text-sm transition-colors"
            :class="answers[qi] === oi
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
              : 'border-stone-200 dark:border-stone-800 hover:border-primary-300'"
            @click="answers[qi] = oi"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <UButton :disabled="!allAnswered" @click="submitDrill">
        Проверить
      </UButton>
    </template>

    <div v-else-if="phase === 'result' && drill && score" class="rounded-lg border p-5"
      :class="score.correct / score.total >= 0.6 ? 'border-green-300 bg-green-50 dark:bg-green-950/30' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/30'"
    >
      <div class="font-medium mb-3">
        Результат: {{ score.correct }} / {{ score.total }}
      </div>

      <div v-for="(q, qi) in drill.questions" :key="qi" class="text-sm mb-3">
        <p class="mb-1">
          {{ qi + 1 }}. {{ q.prompt }}
        </p>
        <p :class="answers[qi] === q.correctIndex ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
          Твой ответ: {{ q.options[answers[qi]!] }}
          <span v-if="answers[qi] !== q.correctIndex"> — правильно: {{ q.options[q.correctIndex] }}</span>
        </p>
      </div>

      <UButton variant="soft" @click="tryAgain">
        К объяснению
      </UButton>
    </div>
  </UContainer>
</template>
