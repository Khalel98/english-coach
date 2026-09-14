<script setup lang="ts">
const route = useRoute()
const open = ref(false)

watch(() => route.fullPath, () => { open.value = false })

interface NavItem { to: string; label: string; icon: string }
interface NavGroup { label: string | null; items: NavItem[] }

const groups: NavGroup[] = [
  { label: null, items: [{ to: '/', label: 'Главная', icon: 'home' }] },
  {
    label: 'Тренировка',
    items: [
      { to: '/chat', label: 'Чат', icon: 'chat' },
      { to: '/scenarios', label: 'Сценарии', icon: 'scenarios' },
      { to: '/boss-battles', label: 'Boss Battle', icon: 'boss-battle' },
      { to: '/missions', label: 'Миссии', icon: 'missions' },
    ],
  },
  {
    label: 'Обучение',
    items: [
      { to: '/vocabulary', label: 'Слова', icon: 'vocabulary' },
      { to: '/grammar-practice', label: 'Грамматика', icon: 'grammar' },
    ],
  },
  {
    label: 'Прогресс',
    items: [
      { to: '/placement-test', label: 'Тест уровня', icon: 'placement-test' },
      { to: '/mistakes', label: 'Ошибки', icon: 'mistakes' },
      { to: '/english-dna', label: 'English DNA', icon: 'dna' },
    ],
  },
]

const CEFR_SHORT: Record<string, string> = {
  beginner: 'A1',
  elementary: 'A2',
  intermediate: 'B1',
  upper_intermediate: 'B2',
  advanced: 'C1+',
}

const level = ref<string | null>(null)
onMounted(async () => {
  try {
    const res = await $fetch<{ estimatedLevel: string }>('/api/profile')
    level.value = CEFR_SHORT[res.estimatedLevel] ?? null
  } catch (e) {
    // Non-critical — the chip just won't show a level this time.
  }
})

function isActive(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <!-- Mobile top bar -->
  <div class="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-stone-200 dark:border-stone-800" style="background-color: var(--app-bg)">
    <button class="p-2 -ml-2 text-stone-500 dark:text-stone-400" aria-label="Открыть меню" @click="open = true">
      <NavIcon name="menu" />
    </button>
    <span class="font-serif text-lg tracking-tight">English Coach</span>
    <NuxtLink
      to="/english-dna"
      class="text-xs font-medium px-2 py-1 rounded-full"
      style="color: var(--color-amber-chip); background-color: color-mix(in srgb, var(--color-amber-chip) 15%, transparent)"
    >
      {{ level ?? '···' }}
    </NuxtLink>
  </div>

  <!-- Mobile drawer overlay -->
  <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="open" class="md:hidden fixed inset-0 z-40 bg-black/50" @click="open = false" />
  </Transition>

  <!-- Sidebar (drawer on mobile, persistent on desktop) -->
  <aside
    class="fixed md:sticky top-0 left-0 z-50 md:z-0 h-dvh w-72 md:w-60 shrink-0 flex flex-col border-r border-stone-200 dark:border-stone-800 overflow-y-auto transition-transform duration-200 md:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
    style="background-color: var(--app-bg-raised)"
  >
    <div class="flex items-center justify-between px-5 pt-6 pb-4">
      <NuxtLink to="/" class="font-serif text-xl tracking-tight">
        English Coach
      </NuxtLink>
      <button class="md:hidden p-1 text-stone-400" aria-label="Закрыть меню" @click="open = false">
        <NavIcon name="close" />
      </button>
    </div>

    <nav class="flex-1 px-3 pb-6">
      <div v-for="(group, gi) in groups" :key="gi" class="mb-5">
        <div v-if="group.label" class="px-3 mb-1 text-xs text-stone-400 dark:text-stone-500">
          {{ group.label }}
        </div>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-lg text-sm transition-colors"
          :class="isActive(item.to)
            ? 'bg-moss-100 dark:bg-moss-950/50 text-moss-700 dark:text-moss-300 font-medium'
            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'"
        >
          <NavIcon :name="item.icon" />
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>

    <NuxtLink
      to="/english-dna"
      class="mx-3 mb-5 flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
      style="background-color: color-mix(in srgb, var(--color-amber-chip) 12%, transparent)"
    >
      <span class="text-stone-600 dark:text-stone-300">Твой уровень</span>
      <span class="font-medium" style="color: var(--color-amber-chip)">{{ level ?? '···' }}</span>
    </NuxtLink>
  </aside>
</template>
