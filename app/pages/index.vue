<script setup lang="ts">
import type { DashboardView } from '../../shared/types'
import { ENGLISH_LEVEL_LABEL, DNA_CONFIDENCE_LABEL, DNA_DIMENSION_LABEL, BOSS_BATTLE_VERDICT_LABEL } from '../utils/labels'

const { data, pending } = await useFetch<DashboardView>('/api/dashboard')

const MISTAKE_TYPE_LABEL: Record<string, string> = {
  grammar: 'грамматика',
  vocabulary: 'словарный запас',
}

function ruSkills(keys: string[]): string {
  return keys.map(k => DNA_DIMENSION_LABEL[k] ?? k).join(', ')
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div v-if="pending" class="text-sm text-stone-400">
      Загрузка…
    </div>

    <template v-else-if="data">
      <div
        v-if="!data.placementTestTaken"
        class="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-center justify-between gap-4"
      >
        <div>
          <div class="font-medium mb-0.5">
            📋 Уровень пока не подтверждён
          </div>
          <p class="text-sm text-stone-600 dark:text-stone-300">
            Сейчас это просто самооценка. Пройди короткий тест (5-7 минут), чтобы приложение точно знало твой уровень.
          </p>
        </div>
        <UButton to="/placement-test" variant="soft" class="shrink-0">
          Пройти тест
        </UButton>
      </div>

      <div class="mb-8">
        <p class="text-sm text-stone-500 dark:text-stone-400 mb-1">
          С возвращением. Твой уровень: <span class="font-medium">{{ ENGLISH_LEVEL_LABEL[data.profile.estimatedLevel] ?? data.profile.estimatedLevel }}</span>
        </p>
        <h1 class="text-2xl font-semibold mb-4">
          Готов к сегодняшней сессии?
        </h1>
        <UButton to="/chat" size="lg">
          Начать сегодняшнюю сессию →
        </UButton>
        <p class="text-xs text-stone-400 mt-2">
          Приложение уже знает, над чем работать — загляни в баннер фокуса внутри чата.
        </p>
      </div>

      <div class="mb-8">
        <div class="font-medium mb-2 text-stone-500 dark:text-stone-400 text-sm">
          Учиться напрямую
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <NuxtLink to="/vocabulary" class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors">
            <div class="font-medium mb-1">
              🔤 Словарные карточки
            </div>
            <p class="text-sm text-stone-500 dark:text-stone-400">
              Повторение по расписанию + новые слова под твой уровень
            </p>
          </NuxtLink>
          <NuxtLink to="/grammar-practice" class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors">
            <div class="font-medium mb-1">
              📐 Тренировка грамматики
            </div>
            <p class="text-sm text-stone-500 dark:text-stone-400">
              Объяснение правила + упражнения на твою слабую тему
            </p>
          </NuxtLink>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        <NuxtLink
          v-if="data.currentMission"
          to="/missions"
          class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors"
        >
          <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">
            Сегодняшняя миссия
          </div>
          <div class="font-medium mb-1">
            {{ data.currentMission.mission.titleRu }}
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            {{ data.currentMission.mission.instructionRu }}
          </p>
        </NuxtLink>

        <NuxtLink
          v-if="data.lastMistake"
          to="/mistakes"
          class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors"
        >
          <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">
            Последняя пойманная ошибка
          </div>
          <div class="font-medium mb-1">
            {{ MISTAKE_TYPE_LABEL[data.lastMistake.mistakeType] ?? data.lastMistake.mistakeType }} / {{ data.lastMistake.topic.replace(/_/g, ' ') }}
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            <span class="line-through text-red-400">{{ data.lastMistake.incorrectExample }}</span>
            → <span class="text-green-600 dark:text-green-400">{{ data.lastMistake.correctExample }}</span>
          </p>
        </NuxtLink>
        <div v-else class="rounded-lg border border-stone-200 dark:border-stone-800 p-4 text-sm text-stone-400">
          Пока ошибок не поймано — продолжай общаться, чтобы накопить профиль.
        </div>
      </div>

      <NuxtLink to="/english-dna" class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 mb-8 hover:border-primary-500 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <div class="font-medium">
            🧬 English DNA
          </div>
          <span class="text-xs text-stone-400">достоверность данных: {{ DNA_CONFIDENCE_LABEL[data.dna.dataConfidence] }}</span>
        </div>
        <div class="flex gap-6 text-sm">
          <div>
            <div class="text-xs text-stone-400 mb-0.5">Сильнее всего</div>
            <div>{{ ruSkills(data.dna.strongestSkills) || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-stone-400 mb-0.5">Слабее всего</div>
            <div>{{ ruSkills(data.dna.weakestSkills) || '—' }}</div>
          </div>
        </div>
      </NuxtLink>

      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        <NuxtLink to="/scenarios" class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors">
          <div class="font-medium mb-1">
            🎭 Сценарии
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            {{ data.scenarioCount }} жизненных ситуаций для практики
          </p>
        </NuxtLink>

        <NuxtLink to="/boss-battles" class="block rounded-lg border border-stone-200 dark:border-stone-800 p-4 hover:border-primary-500 transition-colors">
          <div class="font-medium mb-1">
            🗡️ Boss Battle
          </div>
          <p class="text-sm text-stone-500 dark:text-stone-400">
            {{ data.recentBossBattles.length ? `Последний: ${BOSS_BATTLE_VERDICT_LABEL[data.recentBossBattles[0]!.verdict]}` : 'Пока не пройдено' }}
          </p>
        </NuxtLink>
      </div>

      <div v-if="data.recentMissions.length" class="text-sm">
        <div class="font-medium mb-2 text-stone-500 dark:text-stone-400">
          Недавняя активность
        </div>
        <div class="flex flex-col gap-1">
          <div v-for="m in data.recentMissions" :key="m.logId" class="text-stone-500 dark:text-stone-400">
            ✅ {{ m.mission.titleRu }}
          </div>
        </div>
      </div>
    </template>
  </UContainer>
</template>
