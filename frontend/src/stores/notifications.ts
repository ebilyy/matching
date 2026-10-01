import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  text: string
  color: 'error' | 'success' | 'info'
}

/** Queue consumed by <v-snackbar-queue> in AppToasts. */
export const useNotificationsStore = defineStore('notifications', () => {
  const queue = ref<Toast[]>([])

  function push(text: string, color: Toast['color']) {
    queue.value.push({ text, color })
  }

  return {
    queue,
    error: (text: string) => push(text, 'error'),
    success: (text: string) => push(text, 'success'),
    info: (text: string) => push(text, 'info'),
  }
})
