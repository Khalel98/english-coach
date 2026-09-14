<script setup lang="ts">
import type { ChatMessage } from '../../shared/types'

interface NpcListItem {
  id: string
  name: string
  professionRu: string
}

const { data: npcData } = await useFetch<{ npcs: NpcListItem[] }>('/api/npcs')
const npcId = ref<string | undefined>(undefined)

const npcOptions = computed(() => [
  { label: 'Обычный учитель', value: undefined },
  ...(npcData.value?.npcs ?? []).map(n => ({ label: `${n.name} — ${n.professionRu}`, value: n.id })),
])

const initialMessages: ChatMessage[] = [
  { role: 'assistant', content: "Hi! I'm your AI English conversation partner. What's on your mind today?" },
]
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <h1 class="text-xl font-semibold mb-4">
      Чат
    </h1>

    <div class="mb-4">
      <label class="block text-xs text-stone-500 dark:text-stone-400 mb-1">Собеседник</label>
      <USelect
        v-model="npcId"
        :items="npcOptions"
        value-key="value"
        class="w-full max-w-xs"
      />
    </div>

    <ChatPanel
      :key="npcId ?? 'default'"
      :initial-messages="initialMessages"
      :npc-id="npcId"
      :storage-key="`npc-${npcId ?? 'default'}`"
    />
  </UContainer>
</template>
