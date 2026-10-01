import { onMounted, ref, shallowRef } from 'vue'

import type { components } from '@/api/schema'

type Page<T> = components['schemas']['PageInfo'] & { items: T[] }

/**
 * Cursor-paginated list (opaque `after` cursor) with "load more". Errors are already toasted
 * by the api client; `failed` covers the first page only, a failed "load more" just stops.
 */
export function useCursorList<T>(fetchPage: (after?: string) => Promise<{ data?: Page<T> }>) {
  const items = shallowRef<T[]>([])
  const nextCursor = ref<string | null>(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const failed = ref(false)

  async function reload() {
    loading.value = true
    try {
      const { data } = await fetchPage()
      failed.value = data === undefined
      items.value = data?.items ?? []
      nextCursor.value = data?.has_next ? data.next_cursor : null
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!nextCursor.value) return
    loadingMore.value = true
    try {
      const { data } = await fetchPage(nextCursor.value)
      if (!data) return
      items.value = [...items.value, ...data.items]
      nextCursor.value = data.has_next ? data.next_cursor : null
    } catch {
      // Toasted by the api client; the button stays for a retry.
    } finally {
      loadingMore.value = false
    }
  }

  /** Puts a created or updated item in place without refetching the list. */
  function upsert(item: T, key: (item: T) => string) {
    const index = items.value.findIndex((existing) => key(existing) === key(item))
    items.value =
      index === -1
        ? [...items.value, item]
        : items.value.map((existing, i) => (i === index ? item : existing))
  }

  onMounted(reload)

  return { items, nextCursor, loading, loadingMore, failed, reload, loadMore, upsert }
}
