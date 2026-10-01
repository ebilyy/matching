<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useCursorList } from '@/composables/useCursorList'
import NameDialog, { type NameSubmitResult } from '@/components/NameDialog.vue'
import PageState from '@/components/PageState.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDateTime } from '@/utils/format'

type Shop = components['schemas']['Shop']

// Operator screen (api-sync-report D-16): shops across tenants. The role guard is pending.
const { items, nextCursor, loading, loadingMore, failed, reload, loadMore } = useCursorList(
  (after?: string) => api.GET('/api/v1/shops', { params: { query: { after } } }),
)

const router = useRouter()
const notifications = useNotificationsStore()
const creating = ref(false)

function open(shop: Shop) {
  router.push({ name: 'shop', params: { shopId: shop.id } })
}

async function create(name: string): Promise<NameSubmitResult> {
  const { data, error } = await api.POST('/api/v1/shops', { body: { name } })
  if (!data) return { saved: false, details: error?.details }
  notifications.success('Магазин створено')
  open(data)
  return { saved: true }
}
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h1 class="text-2xl font-semibold">Магазини</h1>
    <v-btn color="primary" prepend-icon="mdi-plus" @click="creating = true">Додати</v-btn>
  </div>
  <v-alert type="info" variant="tonal" density="compact" class="mb-4">
    Розділ оператора: тут видно всі магазини, а не лише ваш.
  </v-alert>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <v-table hover>
      <thead>
        <tr>
          <th>Назва</th>
          <th>Створено</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="items.length === 0">
          <td colspan="2" class="py-6 text-center opacity-70">Магазинів ще немає.</td>
        </tr>
        <tr v-for="shop in items" :key="shop.id" class="cursor-pointer" @click="open(shop)">
          <td>
            <router-link
              :to="{ name: 'shop', params: { shopId: shop.id } }"
              class="font-medium"
              @click.stop
            >
              {{ shop.name }}
            </router-link>
          </td>
          <td>{{ formatDateTime(shop.created_at) }}</td>
        </tr>
      </tbody>
    </v-table>
    <div v-if="nextCursor" class="mt-4 flex justify-center">
      <v-btn variant="tonal" :loading="loadingMore" @click="loadMore">Показати ще</v-btn>
    </div>
  </PageState>

  <NameDialog
    v-model="creating"
    title="Новий магазин"
    label="Назва магазину *"
    field="name"
    submit-text="Додати"
    :submit="create"
  />
</template>
