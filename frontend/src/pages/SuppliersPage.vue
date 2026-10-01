<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'
import SupplierFormDialog from '@/components/SupplierFormDialog.vue'
import { formatDateTime } from '@/utils/format'

// Upload / feed screens come in T36.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/suppliers'))

const router = useRouter()
const creating = ref(false)

function open(supplier: components['schemas']['Supplier']) {
  router.push({ name: 'supplier', params: { supplierId: supplier.id } })
}
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h1 class="text-2xl font-semibold">Постачальники</h1>
    <v-btn color="primary" prepend-icon="mdi-plus" @click="creating = true">Додати</v-btn>
  </div>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <v-table v-if="data" hover>
      <thead>
        <tr>
          <th>Назва</th>
          <th>Контакти</th>
          <th>Дата прайсу</th>
          <th>Фід</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.items.length === 0">
          <td colspan="4" class="py-6 text-center opacity-70">Постачальників ще немає.</td>
        </tr>
        <tr
          v-for="supplier in data.items"
          :key="supplier.id"
          class="cursor-pointer"
          @click="open(supplier)"
        >
          <td>
            <router-link
              :to="{ name: 'supplier', params: { supplierId: supplier.id } }"
              class="font-medium"
              @click.stop
            >
              {{ supplier.name }}
            </router-link>
          </td>
          <td>
            <div v-if="supplier.email">{{ supplier.email }}</div>
            <div v-if="supplier.phone" class="opacity-70">{{ supplier.phone }}</div>
            <span v-if="!supplier.email && !supplier.phone">—</span>
          </td>
          <td>
            {{ formatDateTime(supplier.price_date) }}
            <v-chip v-if="supplier.is_price_stale" color="warning" size="small" class="ml-2">
              застарілий
            </v-chip>
          </td>
          <td>{{ supplier.feed_url ? 'так' : '—' }}</td>
        </tr>
      </tbody>
    </v-table>
  </PageState>

  <SupplierFormDialog v-model="creating" @saved="open" />
</template>
