<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { watch } from 'vue'

import { api } from '@/api/client'
import { useLoad } from '@/composables/useLoad'
import { useAuthStore } from '@/stores/auth'

// Dev placeholder for RequestContext (T03): the bearer token is the shop id, so picking
// a shop here is "logging in" as it. The shops list is the operator API and needs no token.
const { token } = storeToRefs(useAuthStore())
const { data, loading, reload } = useLoad(() =>
  api.GET('/api/v1/shops', { params: { query: { limit: 100 } } }),
)

// No shop picked yet (or the picked one is gone): act as the first shop, so tenant screens
// work without a manual step instead of answering 401.
watch(data, (page) => {
  const ids = page?.items.map((shop) => shop.id) ?? []
  if (ids.length && !ids.includes(token.value)) token.value = ids[0]!
})
</script>

<template>
  <v-select
    v-model="token"
    :items="data?.items ?? []"
    item-title="name"
    item-value="id"
    :loading="loading"
    class="w-64"
    label="Магазин (dev)"
    prepend-inner-icon="mdi-storefront-outline"
    density="compact"
    variant="outlined"
    hide-details
    clearable
    no-data-text="Немає магазинів — створіть у розділі «Магазини»"
    @update:menu="(open: boolean) => open && reload()"
  />
</template>
