<script setup lang="ts">
import type { EnglishDnaProfile, DnaDimension } from '../../../shared/types'
import { DNA_DIMENSION_LABEL, DNA_RATING_LABEL, DNA_CONFIDENCE_LABEL, ENGLISH_LEVEL_LABEL } from '../../utils/labels'

const { data, pending } = await useFetch<EnglishDnaProfile>('/api/english-dna')

const RATING_COLOR: Record<string, string> = {
  weak: 'text-red-500',
  developing: 'text-amber-500',
  strong: 'text-green-500',
  insufficient_data: 'text-stone-400',
}

const MISTAKE_TYPE_LABEL: Record<string, string> = {
  grammar: 'грамматика',
  vocabulary: 'словарный запас',
}

function dim(profile: EnglishDnaProfile, key: keyof EnglishDnaProfile['dimensions']): DnaDimension {
  return profile.dimensions[key]
}

const maxTrend = computed(() => Math.max(1, ...(data.value?.activityTrend.map(w => w.missionsCompleted) ?? [1])))
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold">
        🧬 English DNA
      </h1>
      <NuxtLink to="/placement-test" class="text-sm text-primary-500 hover:underline">
        Пересдать тест на уровень →
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-sm text-stone-400">
      Загрузка…
    </div>

    <template v-else-if="data">
      <div class="mb-6">
        <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">
          Общий уровень (достоверность данных: {{ DNA_CONFIDENCE_LABEL[data.dataConfidence] }})
        </div>
        <div class="text-lg font-semibold mb-1">
          {{ ENGLISH_LEVEL_LABEL[data.overallLevel.stated] ?? data.overallLevel.stated }}
        </div>
        <p class="text-sm text-stone-500 dark:text-stone-400">
          {{ data.overallLevel.note }}
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div
          v-for="key in Object.keys(DNA_DIMENSION_LABEL)"
          :key="key"
          class="rounded-lg border border-stone-200 dark:border-stone-800 p-3"
        >
          <div class="text-xs text-stone-400 mb-1">
            {{ DNA_DIMENSION_LABEL[key] }}
          </div>
          <div class="font-medium mb-1" :class="RATING_COLOR[dim(data, key as any).rating]">
            {{ DNA_RATING_LABEL[dim(data, key as any).rating] }}
          </div>
          <div class="text-xs text-stone-400">
            {{ dim(data, key as any).basis }}
          </div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <div class="font-medium mb-1">Почему у тебя такой уровень</div>
          <p class="text-stone-600 dark:text-stone-300">{{ data.narrative.whyThisLevel }}</p>
        </div>
        <div>
          <div class="font-medium mb-1">Что у тебя получается хорошо</div>
          <p class="text-stone-600 dark:text-stone-300">{{ data.narrative.whatYoureDoingWell }}</p>
        </div>
        <div>
          <div class="font-medium mb-1">Что тебя тормозит</div>
          <p class="text-stone-600 dark:text-stone-300">{{ data.narrative.whatsHoldingYouBack }}</p>
        </div>
        <div>
          <div class="font-medium mb-1">Что практиковать дальше</div>
          <p class="text-stone-600 dark:text-stone-300">{{ data.narrative.whatToStudyNext }}</p>
        </div>
      </div>

      <div v-if="data.mistakesYouStoppedMaking.length" class="mb-6 text-sm">
        <div class="font-medium mb-1">
          🎉 Ошибки, которые ты перестал совершать
        </div>
        <ul class="list-disc pl-4 text-stone-600 dark:text-stone-300">
          <li v-for="m in data.mistakesYouStoppedMaking" :key="m.topic">
            {{ MISTAKE_TYPE_LABEL[m.mistakeType] ?? m.mistakeType }} / {{ m.topic.replace(/_/g, ' ') }}
          </li>
        </ul>
      </div>

      <div v-if="data.recurringMistakes.length" class="mb-6 text-sm">
        <div class="font-medium mb-1">Повторяющиеся ошибки</div>
        <ul class="list-disc pl-4 text-stone-600 dark:text-stone-300">
          <li v-for="m in data.recurringMistakes" :key="m.topic">
            {{ MISTAKE_TYPE_LABEL[m.mistakeType] ?? m.mistakeType }} / {{ m.topic.replace(/_/g, ' ') }} — встречалось {{ m.occurrences }} раз
          </li>
        </ul>
      </div>

      <div class="text-sm">
        <div class="font-medium mb-2">Активность по неделям (выполненные миссии)</div>
        <div class="flex items-end gap-2 h-16">
          <div v-for="w in data.activityTrend" :key="w.weekStart" class="flex flex-col items-center gap-1 flex-1">
            <div
              class="w-full bg-primary-500 rounded-t"
              :style="{ height: `${(w.missionsCompleted / maxTrend) * 100}%`, minHeight: w.missionsCompleted > 0 ? '4px' : '0' }"
            />
            <div class="text-[10px] text-stone-400">{{ w.weekStart.slice(5) }}</div>
          </div>
        </div>
      </div>
    </template>
  </UContainer>
</template>
