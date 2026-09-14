<script setup lang="ts">
import type { ChatMessage, ChatResponseBody } from '../../../shared/types'
import { hasPersistedChat } from '../../utils/chatStorage'

const route = useRoute()
const scenarioId = route.params.id as string
const storageKey = `scenario-${scenarioId}`

interface ScenarioDetail {
  id: string
  titleRu: string
  objectiveRu: string
  contextRu: string
  npc: { name: string; role: string }
}

const { data: scenarioData } = await useFetch<{ scenarios: ScenarioDetail[] }>('/api/scenarios')
const scenario = computed(() => scenarioData.value?.scenarios.find(s => s.id === scenarioId))

const starting = ref(true)
const startError = ref(false)
const initialMessages = ref<ChatMessage[]>([])

async function start() {
  starting.value = true
  startError.value = false
  try {
    const res = await $fetch<ChatResponseBody>(`/api/scenarios/${scenarioId}/start`, { method: 'POST' })
    initialMessages.value = [res.message]
  } catch (e) {
    startError.value = true
  } finally {
    starting.value = false
  }
}

onMounted(() => {
  // If there's already a saved conversation for this scenario, ChatPanel will
  // restore it itself — no need to (re-)generate an opening line that would
  // just be discarded.
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
        {{ scenario?.titleRu ?? 'Сценарий' }}
      </h1>
      <NuxtLink to="/scenarios" class="text-sm text-primary-500 hover:underline">
        ← Все сценарии
      </NuxtLink>
    </div>

    <p v-if="scenario" class="text-sm text-stone-500 dark:text-stone-400 mb-6">
      {{ scenario.contextRu }}
    </p>

    <div v-if="starting" class="text-sm text-stone-400">
      Готовим сцену…
    </div>
    <div v-else-if="startError" class="text-sm text-red-500">
      Не удалось начать сценарий. <UButton size="xs" variant="link" @click="start">
        Попробовать снова
      </UButton>
    </div>
    <ChatPanel
      v-else
      :key="scenarioId"
      :initial-messages="initialMessages"
      :scenario-id="scenarioId"
      :storage-key="storageKey"
      :show-focus-banner="false"
    />
  </UContainer>
</template>
