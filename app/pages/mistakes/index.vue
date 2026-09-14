<script setup lang="ts">
import type { MistakeView } from '../../../shared/types'
import { MISTAKE_CONFIDENCE_LABEL } from '../../utils/labels'

const { data, pending } = await useFetch<MistakeView[]>('/api/mistakes')

const MISTAKE_TYPE_LABEL: Record<string, string> = {
  grammar: 'грамматика',
  vocabulary: 'словарный запас',
}

const CONFIDENCE_COLOR: Record<string, string> = {
  low: 'text-stone-400',
  medium: 'text-amber-500',
  high: 'text-red-500',
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-1">
      История ошибок
    </h1>
    <p class="text-sm text-stone-500 dark:text-stone-400 mb-6">
      Каждый паттерн отслеживается, но только повторяющиеся (3+ раз) влияют на то, как AI подстраивается под тебя.
    </p>

    <div v-if="pending" class="text-sm text-stone-400">
      Загрузка…
    </div>
    <div v-else-if="!data?.length" class="text-sm text-stone-400">
      Пока ошибок не зафиксировано — это либо отличный английский, либо просто мало разговоров.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="m in data"
        :key="`${m.mistakeType}-${m.topic}`"
        class="rounded-lg border border-stone-200 dark:border-stone-800 p-4"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="font-medium">{{ MISTAKE_TYPE_LABEL[m.mistakeType] ?? m.mistakeType }} / {{ m.topic.replace(/_/g, ' ') }}</span>
          <span class="text-xs" :class="CONFIDENCE_COLOR[m.confidence]">
            {{ MISTAKE_CONFIDENCE_LABEL[m.confidence] }} · {{ m.occurrences }}×
          </span>
        </div>
        <p class="text-sm text-stone-600 dark:text-stone-300 mb-1">
          <span class="line-through text-red-400">{{ m.incorrectExample }}</span>
          →
          <span class="text-green-600 dark:text-green-400">{{ m.correctExample }}</span>
        </p>
        <p class="text-xs text-stone-400">
          {{ m.explanation }}
        </p>
      </div>
    </div>
  </UContainer>
</template>
