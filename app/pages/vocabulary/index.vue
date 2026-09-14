<script setup lang="ts">
import type { VocabularyCardView } from '../../../shared/types'

const cards = ref<VocabularyCardView[]>([])
const index = ref(0)
const revealed = ref(false)
const loading = ref(true)
const submitting = ref(false)

async function loadBatch() {
  loading.value = true
  try {
    const res = await $fetch<{ cards: VocabularyCardView[] }>('/api/vocabulary/study')
    cards.value = res.cards
    index.value = 0
    revealed.value = false
  } finally {
    loading.value = false
  }
}

const currentCard = computed(() => cards.value[index.value] ?? null)
const done = computed(() => !loading.value && cards.value.length > 0 && index.value >= cards.value.length)

async function answer(knewIt: boolean) {
  if (!currentCard.value || submitting.value) return
  submitting.value = true
  try {
    await $fetch('/api/vocabulary/review', { method: 'POST', body: { wordId: currentCard.value.id, knewIt } })
    index.value += 1
    revealed.value = false
  } finally {
    submitting.value = false
  }
}

onMounted(loadBatch)
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-1">
      Словарные карточки
    </h1>
    <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">
      Сначала карточки на повторение (по расписанию), затем новые слова около твоего уровня.
    </p>

    <div v-if="loading" class="text-sm text-stone-400">
      Загрузка…
    </div>

    <div v-else-if="!cards.length" class="text-sm text-stone-400">
      Слов пока нет.
    </div>

    <div v-else-if="done" class="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 p-5">
      <div class="font-medium mb-2">
        🎉 Готово на сегодня
      </div>
      <p class="text-sm text-stone-600 dark:text-stone-300 mb-4">
        Ты прошёл {{ cards.length }} карточек. Следующие появятся по расписанию, когда придёт время их повторить.
      </p>
      <UButton variant="soft" @click="loadBatch">
        Ещё карточки
      </UButton>
    </div>

    <div v-else-if="currentCard" class="rounded-lg border border-stone-200 dark:border-stone-800 p-6">
      <div class="text-xs text-stone-400 uppercase tracking-wide mb-4">
        Карточка {{ index + 1 }} из {{ cards.length }} · {{ currentCard.cefrLevel }}
      </div>

      <div class="text-2xl font-semibold mb-6 text-center">
        {{ currentCard.word }}
      </div>

      <div v-if="!revealed" class="flex justify-center">
        <UButton size="lg" @click="revealed = true">
          Показать перевод
        </UButton>
      </div>

      <template v-else>
        <div class="text-center mb-6">
          <div class="text-lg mb-2">
            {{ currentCard.translationRu }}
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400 italic">
            {{ currentCard.exampleSentence }}
          </p>
        </div>

        <div class="flex justify-center gap-3">
          <UButton color="error" variant="soft" :loading="submitting" @click="answer(false)">
            Не знал
          </UButton>
          <UButton color="success" variant="soft" :loading="submitting" @click="answer(true)">
            Знал
          </UButton>
        </div>
      </template>
    </div>
  </UContainer>
</template>
