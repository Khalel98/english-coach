export function chatStorageFullKey(storageKey: string): string {
  return `english-coach:chat:${storageKey}`
}

export function hasPersistedChat(storageKey: string): boolean {
  try {
    const raw = localStorage.getItem(chatStorageFullKey(storageKey))
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
  } catch (e) {
    return false
  }
}
