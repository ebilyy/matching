import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pm.dev-token'

function readToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Dev bearer token (placeholder auth, SAD §11). Kept in localStorage across reloads. */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(readToken())

  watch(token, (value) => {
    try {
      if (value) localStorage.setItem(STORAGE_KEY, value)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage blocked (private window): the token lives for this tab only.
    }
  })

  return { token }
})
