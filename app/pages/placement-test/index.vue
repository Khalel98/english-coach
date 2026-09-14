<script setup lang="ts">
import type { PlacementQuestionView, PlacementTestResultView } from '../../../shared/types'
import { ENGLISH_LEVEL_LABEL } from '../../utils/labels'

// Mirrors server/services/placementTest.ts QUESTIONS_PER_SKILL * 2 skills — kept
// as a local display-only constant since server code isn't importable client-side.
const TOTAL_QUESTIONS = 12

type Phase = 'intro' | 'loading' | 'quiz' | 'open' | 'result'

const phase = ref<Phase>('intro')
const history = ref<{ questionId: string; selectedIndex: number }[]>([])
const currentQuestion = ref<PlacementQuestionView | null>(null)
const selectedOption = ref<number | null>(null)

const openPrompts = ref<string[]>([])
const openAnswers = ref<string[]>([])

const result = ref<PlacementTestResultView | null>(null)

const SKILL_LABEL: Record<string, string> = { grammar: 'Грамматика', vocabulary: 'Словарный запас' }

async function loadNextQuestion() {
  phase.value = 'loading'
  const res = await $fetch<{ question: PlacementQuestionView | null }>('/api/placement-test/next-question', {
    method: 'POST',
    body: { history: history.value },
  })
  if (res.question) {
    currentQuestion.value = res.question
    selectedOption.value = null
    phase.value = 'quiz'
  } else {
    await startOpenPhase()
  }
}

async function startOpenPhase() {
  const res = await $fetch<{ prompts: string[] }>('/api/placement-test/open-prompts')
  openPrompts.value = res.prompts
  openAnswers.value = res.prompts.map(() => '')
  phase.value = 'open'
}

function submitAnswer() {
  if (selectedOption.value === null || !currentQuestion.value) return
  history.value.push({ questionId: currentQuestion.value.id, selectedIndex: selectedOption.value })
  loadNextQuestion()
}

const submittingOpen = ref(false)

async function submitOpenAnswers() {
  if (openAnswers.value.some(a => !a.trim()) || submittingOpen.value) return
  submittingOpen.value = true
  try {
    result.value = await $fetch<PlacementTestResultView>('/api/placement-test/finish', {
      method: 'POST',
      body: { history: history.value, openAnswers: openAnswers.value },
    })
    phase.value = 'result'
  } finally {
    submittingOpen.value = false
  }
}

function startTest() {
  history.value = []
  loadNextQuestion()
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-6">
      Тест на определение уровня
    </h1>

    <div v-if="phase === 'intro'" class="rounded-lg border border-stone-200 dark:border-stone-800 p-5">
      <p class="text-sm text-stone-600 dark:text-stone-300 mb-3">
        Короткий тест — около 5-7 минут. Сначала 12 вопросов по грамматике и словарному запасу (сложность подстраивается по ходу теста),
        затем два открытых вопроса, на которые нужно ответить свободным текстом на английском.
      </p>
      <p class="text-sm text-stone-600 dark:text-stone-300 mb-4">
        По результату определится твой уровень (по шкале CEFR), и это сразу начнёт влиять на то, что тебе предлагает приложение.
        Тест можно пересдать в любой момент.
      </p>
      <UButton @click="startTest">
        Начать тест
      </UButton>
    </div>

    <div v-else-if="phase === 'loading'" class="text-sm text-stone-400">
      Загрузка…
    </div>

    <div v-else-if="phase === 'quiz' && currentQuestion" class="rounded-lg border border-stone-200 dark:border-stone-800 p-5">
      <div class="text-xs text-stone-400 uppercase tracking-wide mb-3">
        Вопрос {{ history.length + 1 }} из {{ TOTAL_QUESTIONS }} · {{ SKILL_LABEL[currentQuestion.skill] }}
      </div>
      <p class="font-medium mb-4">
        {{ currentQuestion.prompt }}
      </p>
      <div class="flex flex-col gap-2 mb-4">
        <button
          v-for="(opt, i) in currentQuestion.options"
          :key="i"
          class="text-left rounded-lg border px-4 py-2 text-sm transition-colors"
          :class="selectedOption === i
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
            : 'border-stone-200 dark:border-stone-800 hover:border-primary-300'"
          @click="selectedOption = i"
        >
          {{ opt }}
        </button>
      </div>
      <UButton :disabled="selectedOption === null" @click="submitAnswer">
        Далее
      </UButton>
    </div>

    <div v-else-if="phase === 'open'" class="rounded-lg border border-stone-200 dark:border-stone-800 p-5">
      <p class="text-sm text-stone-500 dark:text-stone-400 mb-4">
        Последняя часть — ответь свободно на английском, в паре предложений на каждый вопрос.
      </p>
      <div v-for="(prompt, i) in openPrompts" :key="i" class="mb-4">
        <p class="text-sm font-medium mb-2">
          {{ prompt }}
        </p>
        <UTextarea v-model="openAnswers[i]" :rows="3" class="w-full" placeholder="Write in English…" />
      </div>
      <UButton :loading="submittingOpen" @click="submitOpenAnswers">
        Завершить тест
      </UButton>
    </div>

    <div v-else-if="phase === 'result' && result" class="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 p-5">
      <div class="text-lg font-bold mb-1">
        Твой уровень: {{ result.cefrLevel }} ({{ ENGLISH_LEVEL_LABEL[result.estimatedLevel] }})
      </div>
      <p class="text-sm mb-4">
        {{ result.fluencyNotes }}
      </p>

      <div class="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <div class="text-xs text-stone-400 mb-0.5">Грамматика</div>
          <div class="font-medium">{{ result.grammarScore.correct }} / {{ result.grammarScore.total }}</div>
        </div>
        <div>
          <div class="text-xs text-stone-400 mb-0.5">Словарный запас</div>
          <div class="font-medium">{{ result.vocabularyScore.correct }} / {{ result.vocabularyScore.total }}</div>
        </div>
      </div>

      <div v-if="result.gaps.length" class="text-sm mb-4">
        <div class="font-medium mb-1">Пробелы, которые уже учтены в твоём профиле</div>
        <ul class="list-disc pl-4 text-stone-600 dark:text-stone-300">
          <li v-for="g in result.gaps" :key="`${g.skill}-${g.topic}`">
            {{ SKILL_LABEL[g.skill] }} / {{ g.topic.replace(/_/g, ' ') }} ({{ g.cefrLevel }})
          </li>
        </ul>
      </div>

      <UButton to="/" variant="soft">
        На главную
      </UButton>
    </div>
  </UContainer>
</template>
