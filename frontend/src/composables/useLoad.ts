import { onMounted, ref, shallowRef } from 'vue'

/**
 * Loads one resource on mount. Errors are already toasted by the api client;
 * `failed` lets the screen show its own empty/error state.
 */
export function useLoad<T>(fetcher: () => Promise<{ data?: T }>) {
  const data = shallowRef<T>()
  const loading = ref(false)
  const failed = ref(false)

  async function reload() {
    loading.value = true
    try {
      const { data: result } = await fetcher()
      data.value = result
      failed.value = result === undefined
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(reload)

  return { data, loading, failed, reload }
}
