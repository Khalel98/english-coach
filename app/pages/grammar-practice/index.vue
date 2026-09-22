<script setup lang="ts">
import type { GrammarDrillView } from '../../../shared/types'

interface GrammarTopicGroup {
  categoryRu: string
  topics: { topic: string; labelRu: string }[]
}

type Phase = 'intro' | 'loading' | 'drill' | 'result'

const phase = ref<Phase>('intro')
const groups = ref<GrammarTopicGroup[]>([])
const chosenTopic = ref<string | undefined>(undefined)
const drill = ref<GrammarDrillView | null>(null)
const answers = ref<(number | null)[]>([])
const score = ref<{ correct: number; total: number } | null>(null)

const topicOptions = computed(() => [
  [{ label: 'Автоматически (моя слабая тема)', value: undefined }],
  ...groups.value.map(g => [
    { type: 'label' as const, label: g.categoryRu },
    ...g.topics.map(t => ({ label: t.labelRu, value: t.topic })),
  ]),
])

const explanationParagraphs = computed(() => (drill.value?.explanationRu ?? '').split(/\n{2,}/).filter(Boolean))

const topicLabel = computed(() => {
  if (!drill.value) return ''
  for (const g of groups.value) {
    const match = g.topics.find(t => t.topic === drill.value!.topic)
    if (match) return match.labelRu
  }
  return drill.value.topic.replace(/_/g, ' ')
})

async function loadTopics() {
  const res = await $fetch<{ groups: GrammarTopicGroup[] }>('/api/grammar-drill/topics')
  groups.value = res.groups
}

async function startDrill() {
  phase.value = 'loading'
  drill.value = await $fetch<GrammarDrillView>('/api/grammar-drill/generate', {
    method: 'POST',
    body: { topic: chosenTopic.value },
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
    body: { topic: drill.value.topic, correct, total },
  })
}

function tryAgain() {
  phase.value = 'intro'
  drill.value = null
  score.value = null
}

onMounted(loadTopics)
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-6">
      Тренировка грамматики
    </h1>

    <div v-if="phase === 'intro'" class="rounded-lg border border-stone-200 dark:border-stone-800 p-5">
      <p class="text-sm text-stone-600 dark:text-stone-300 mb-4">
        Короткое объяснение правила и 5 упражнений на него. По умолчанию система сама выбирает твою самую слабую тему грамматики,
        но можно выбрать конкретную тему вручную.
      </p>
      <label class="block text-xs text-stone-500 dark:text-stone-400 mb-1">Тема</label>
      <USelect
        v-model="chosenTopic"
        :items="topicOptions"
        value-key="value"
        class="w-full max-w-xs mb-4"
      />
      <UButton @click="startDrill">
        Начать
      </UButton>
    </div>

    <div v-else-if="phase === 'loading'" class="text-sm text-stone-400">
      Готовим упражнения…
    </div>

    <template v-else-if="phase === 'drill' && drill">
      <div class="rounded-lg border border-stone-200 dark:border-stone-800 p-5 mb-4">
        <div class="text-xs text-stone-400 uppercase tracking-wide mb-2">
          {{ topicLabel }}
        </div>
        <p v-for="(para, pi) in explanationParagraphs" :key="pi" class="text-sm text-stone-600 dark:text-stone-300 mb-2 last:mb-0 whitespace-pre-line">
          {{ para }}
        </p>
      </div>

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
        Другая тема
      </UButton>
    </div>
  </UContainer>
</template>
