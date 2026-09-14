<script setup lang="ts">
import type { MissionLogView } from '../../../shared/types'
import { MISSION_SKILL_LABEL, MISSION_ENGAGEMENT_EMOJI } from '../../utils/labels'

const current = ref<MissionLogView | null>(null)
const loading = ref(true)
const reflection = ref('')
const submitting = ref(false)
const skipping = ref(false)
const evaluation = ref<{ engagement: string; summary: string } | null>(null)
const history = ref<MissionLogView[]>([])

async function loadCurrent() {
  loading.value = true
  try {
    current.value = await $fetch<MissionLogView>('/api/missions/current')
  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  history.value = await $fetch<MissionLogView[]>('/api/missions/history')
}

async function submitReflection() {
  const text = reflection.value.trim()
  if (!text || !current.value || submitting.value) return
  submitting.value = true
  try {
    evaluation.value = await $fetch<{ engagement: string; summary: string }>(`/api/missions/${current.value.logId}/reflect`, {
      method: 'POST',
      body: { reflectionText: text },
    })
    reflection.value = ''
    await loadHistory()
  } finally {
    submitting.value = false
  }
}

async function nextMission() {
  evaluation.value = null
  current.value = null
  await loadCurrent()
}

async function skipMission() {
  if (!current.value || skipping.value) return
  skipping.value = true
  try {
    current.value = await $fetch<MissionLogView>(`/api/missions/${current.value.logId}/skip`, { method: 'POST' })
    reflection.value = ''
    await loadHistory()
  } finally {
    skipping.value = false
  }
}

onMounted(() => {
  loadCurrent()
  loadHistory()
})
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-6">
      Задания в реальной жизни
    </h1>

    <div v-if="loading" class="text-sm text-stone-400">
      Загрузка…
    </div>

    <template v-else-if="current">
      <div v-if="!evaluation" class="rounded-lg border border-stone-200 dark:border-stone-800 p-5 mb-6">
        <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">
          {{ MISSION_SKILL_LABEL[current.mission.skillFocus] ?? current.mission.skillFocus }} · ~{{ current.mission.estimatedMinutes }} мин
        </div>
        <div class="font-medium mb-2">
          {{ current.mission.titleRu }}
        </div>
        <p class="text-sm text-stone-600 dark:text-stone-300 mb-4">
          {{ current.mission.instructionRu }}
        </p>

        <p class="text-xs text-stone-400 mb-3">
          Пойди и сделай это (на английском), потом вернись и расскажи, что произошло — доказательства не нужны, просто расскажи честно.
        </p>

        <UTextarea
          v-model="reflection"
          placeholder="What happened? Tell me about it… (напиши на английском)"
          :rows="4"
          class="w-full mb-3"
        />
        <div class="flex items-center gap-3">
          <UButton :loading="submitting" @click="submitReflection">
            Отправить отчёт
          </UButton>
          <button
            class="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            :disabled="skipping"
            @click="skipMission"
          >
            Эта миссия не подходит — пропустить
          </button>
        </div>
      </div>

      <div v-else class="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 p-5 mb-6">
        <div class="font-medium mb-1">
          {{ MISSION_ENGAGEMENT_EMOJI[evaluation.engagement] }} Задание выполнено
        </div>
        <p class="text-sm mb-4">
          {{ evaluation.summary }}
        </p>
        <UButton variant="soft" @click="nextMission">
          Получить следующее задание
        </UButton>
      </div>
    </template>

    <div v-if="history.length" class="mt-8">
      <h2 class="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 uppercase tracking-wide">
        История
      </h2>
      <div class="flex flex-col gap-2">
        <div v-for="h in history" :key="h.logId" class="text-sm border-b border-stone-200 dark:border-stone-800 pb-2">
          <template v-if="h.skipped">
            <span>⏭️</span>
            <span class="font-medium">{{ h.mission.titleRu }}</span>
            <span class="text-stone-400"> — пропущено</span>
          </template>
          <template v-else>
            <span>{{ MISSION_ENGAGEMENT_EMOJI[h.engagement ?? 'medium'] }}</span>
            <span class="font-medium">{{ h.mission.titleRu }}</span>
            <span class="text-stone-400"> — {{ h.evaluationSummary }}</span>
          </template>
        </div>
      </div>
    </div>
  </UContainer>
</template>
