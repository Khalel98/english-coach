<script setup lang="ts">
import type { ChatMessage, ChatResponseBody, BossBattleResult } from '../../../shared/types'
import { hasPersistedChat } from '../../utils/chatStorage'
import { BOSS_BATTLE_DIMENSION_LABEL, BOSS_BATTLE_RATING_LABEL, BOSS_BATTLE_VERDICT_LABEL } from '../../utils/labels'

const route = useRoute()
const battleId = route.params.id as string
const storageKey = `bossbattle-${battleId}`

interface BossBattleDetail {
  id: string
  titleRu: string
  descriptionRu: string
}

const { data: battleData } = await useFetch<{ bossBattles: BossBattleDetail[] }>('/api/boss-battles')
const battle = computed(() => battleData.value?.bossBattles.find(b => b.id === battleId))

const starting = ref(true)
const startError = ref(false)
const initialMessages = ref<ChatMessage[]>([])
const chatPanel = ref<{ messages: ChatMessage[] } | null>(null)
const result = ref<BossBattleResult | null>(null)
const finishing = ref(false)

async function start() {
  starting.value = true
  startError.value = false
  try {
    const res = await $fetch<ChatResponseBody>(`/api/boss-battles/${battleId}/start`, { method: 'POST' })
    initialMessages.value = [res.message]
  } catch (e) {
    startError.value = true
  } finally {
    starting.value = false
  }
}

async function finishBattle() {
  if (!chatPanel.value || finishing.value) return
  finishing.value = true
  try {
    result.value = await $fetch<BossBattleResult>(`/api/boss-battles/${battleId}/finish`, {
      method: 'POST',
      body: { messages: chatPanel.value.messages },
    })
  } catch (e) {
    // Non-critical — the learner can try finishing again.
  } finally {
    finishing.value = false
  }
}

const RATING_COLOR: Record<string, string> = {
  weak: 'text-red-500',
  developing: 'text-amber-500',
  strong: 'text-green-500',
}

onMounted(() => {
  if (hasPersistedChat(storageKey)) {
    starting.value = false
    return
  }
  start()
})
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-xl font-semibold">
        🗡️ {{ battle?.titleRu ?? 'Boss Battle' }}
      </h1>
      <NuxtLink to="/boss-battles" class="text-sm text-primary-500 hover:underline">
        ← Все бои
      </NuxtLink>
    </div>

    <p v-if="battle" class="text-sm text-stone-500 dark:text-stone-400 mb-6">
      {{ battle.descriptionRu }}
    </p>

    <div v-if="starting" class="text-sm text-stone-400">
      Подключение…
    </div>
    <div v-else-if="startError" class="text-sm text-red-500">
      Не удалось начать бой. <UButton size="xs" variant="link" @click="start">
        Попробовать снова
      </UButton>
    </div>
    <template v-else>
      <ChatPanel
        ref="chatPanel"
        :key="battleId"
        :initial-messages="initialMessages"
        :boss-battle-id="battleId"
        :storage-key="storageKey"
        :show-focus-banner="false"
      />

      <div class="mt-4">
        <UButton variant="soft" color="error" :loading="finishing" @click="finishBattle">
          Завершить бой
        </UButton>
      </div>

      <div v-if="result" class="mt-6 rounded-lg border p-5"
        :class="result.verdict === 'defeated' ? 'border-green-300 bg-green-50 dark:bg-green-950/30' : 'border-red-300 bg-red-50 dark:bg-red-950/30'"
      >
        <div class="text-lg font-bold mb-3">
          {{ BOSS_BATTLE_VERDICT_LABEL[result.verdict] }}
        </div>

        <p class="text-sm mb-4">
          {{ result.summary }}
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-4">
          <div v-for="(label, key) in BOSS_BATTLE_DIMENSION_LABEL" :key="key" class="flex justify-between border-b border-stone-200 dark:border-stone-800 pb-1">
            <span class="text-stone-500 dark:text-stone-400">{{ label }}</span>
            <span class="font-medium" :class="RATING_COLOR[result.dimensions[key as keyof typeof result.dimensions]]">
              {{ BOSS_BATTLE_RATING_LABEL[result.dimensions[key as keyof typeof result.dimensions]] }}
            </span>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div class="font-medium mb-1">Сильные стороны</div>
            <ul class="list-disc pl-4 text-stone-600 dark:text-stone-300">
              <li v-for="s in result.topStrengths" :key="s">{{ s }}</li>
            </ul>
          </div>
          <div>
            <div class="font-medium mb-1">Слабые стороны</div>
            <ul class="list-disc pl-4 text-stone-600 dark:text-stone-300">
              <li v-for="w in result.topWeaknesses" :key="w">{{ w }}</li>
            </ul>
          </div>
        </div>

        <div v-if="result.mostRepeatedMistakes.length" class="text-sm mb-4">
          <div class="font-medium mb-1">Самые частые ошибки</div>
          <ul class="list-disc pl-4 text-stone-600 dark:text-stone-300">
            <li v-for="m in result.mostRepeatedMistakes" :key="m">{{ m }}</li>
          </ul>
        </div>

        <div class="text-sm">
          <div class="font-medium mb-1">Что практиковать на следующей неделе</div>
          <p class="text-stone-600 dark:text-stone-300">{{ result.recommendedPractice }}</p>
        </div>
      </div>
    </template>
  </UContainer>
</template>
