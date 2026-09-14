<script setup lang="ts">
import type { ChatMessage, ChatResponseBody, SessionFocusView, ScenarioResult } from '../../shared/types'
import { chatStorageFullKey } from '../utils/chatStorage'
import { DNA_DIMENSION_LABEL, DNA_RATING_LABEL } from '../utils/labels'

const props = withDefaults(defineProps<{
  initialMessages: ChatMessage[]
  scenarioId?: string
  npcId?: string
  bossBattleId?: string
  showFocusBanner?: boolean
  /** When set, the conversation survives navigating away and back (stored in this browser only). */
  storageKey?: string
}>(), {
  showFocusBanner: true,
})

const messages = ref<ChatMessage[]>([...props.initialMessages])
const draft = ref('')
const sending = ref(false)
const focus = ref<SessionFocusView | null>(null)
const result = ref<ScenarioResult | null>(null)
const finishing = ref(false)

function storageFullKey() {
  return props.storageKey ? chatStorageFullKey(props.storageKey) : null
}

function loadPersistedMessages(): ChatMessage[] | null {
  const key = storageFullKey()
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch (e) {
    return null
  }
}

function persistMessages() {
  const key = storageFullKey()
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(messages.value))
  } catch (e) {
    // Storage can be unavailable (private mode, quota) — losing persistence
    // is better than crashing the conversation.
  }
}

function resetConversation() {
  messages.value = [...props.initialMessages]
  const key = storageFullKey()
  if (key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      // ignore
    }
  }
}

watch(messages, persistMessages, { deep: true })

async function refreshFocus() {
  if (!props.showFocusBanner) return
  try {
    const res = await $fetch<{ focus: SessionFocusView }>('/api/learner-model')
    focus.value = res.focus
  } catch (e) {
    // Non-critical — the banner just won't update this time.
  }
}

async function send() {
  const text = draft.value.trim()
  if (!text || sending.value) return

  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  sending.value = true

  try {
    const res = await $fetch<ChatResponseBody>('/api/chat', {
      method: 'POST',
      body: { messages: messages.value, scenarioId: props.scenarioId, npcId: props.npcId, bossBattleId: props.bossBattleId },
    })
    messages.value.push(res.message)
    refreshFocus()
  } catch (e) {
    messages.value.push({ role: 'assistant', content: 'Sorry, something went wrong on my end.' }) // internal chat message — kept in English, matching the conversation language
  } finally {
    sending.value = false
  }
}

async function finishScenario() {
  if (!props.scenarioId || finishing.value) return
  finishing.value = true
  try {
    result.value = await $fetch<ScenarioResult>(`/api/scenarios/${props.scenarioId}/finish`, {
      method: 'POST',
      body: { messages: messages.value },
    })
  } catch (e) {
    // Non-critical — the learner can just keep chatting or try finishing again.
  } finally {
    finishing.value = false
  }
}

onMounted(() => {
  const persisted = loadPersistedMessages()
  if (persisted) messages.value = persisted
  refreshFocus()
})

defineExpose({ messages, resetConversation })
</script>

<template>
  <div>
    <div
      v-if="focus?.targetTopic"
      class="text-sm text-stone-500 dark:text-stone-400 mb-4 border-l-2 border-primary-500 pl-3"
    >
      Фокус сессии: {{ DNA_DIMENSION_LABEL[focus.targetType ?? ''] ?? focus.targetType }} — {{ focus.targetTopic?.replace(/_/g, ' ') }}
      ({{ focus.skillLevel ? DNA_RATING_LABEL[focus.skillLevel] : '' }})
    </div>

    <div class="flex flex-col gap-3 mb-4">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="rounded-lg px-4 py-2 max-w-[80%]"
        :class="m.role === 'user'
          ? 'bg-primary-500 text-white self-end ml-auto'
          : 'bg-stone-100 dark:bg-stone-800 self-start'"
      >
        {{ m.content }}
      </div>
      <div v-if="sending" class="text-sm text-stone-400">Печатает…</div>
    </div>

    <div
      v-if="result"
      class="mb-4 rounded-lg border p-4"
      :class="result.completed ? 'border-green-300 bg-green-50 dark:bg-green-950/30' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/30'"
    >
      <div class="font-medium mb-1">
        {{ result.completed ? '✅ Цель выполнена' : '🟡 Ещё не совсем' }}
      </div>
      <p class="text-sm mb-2">
        {{ result.summary }}
      </p>
      <ul v-if="result.metConditions.length" class="text-xs text-stone-500 dark:text-stone-400 list-disc pl-4">
        <li v-for="c in result.metConditions" :key="c">
          {{ c }}
        </li>
      </ul>
    </div>

    <div class="flex gap-2">
      <UTextarea
        v-model="draft"
        placeholder="Напиши сообщение на английском…"
        class="flex-1"
        :rows="2"
        @keydown.enter.exact.prevent="send"
      />
      <UButton :loading="sending" @click="send">
        Отправить
      </UButton>
      <UButton
        v-if="scenarioId"
        variant="soft"
        :loading="finishing"
        @click="finishScenario"
      >
        Завершить сценарий
      </UButton>
    </div>

    <button
      v-if="storageKey && messages.length > initialMessages.length"
      class="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 mt-2"
      @click="resetConversation"
    >
      Начать новый разговор
    </button>
  </div>
</template>
