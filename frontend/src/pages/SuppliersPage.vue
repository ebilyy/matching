<script setup lang="ts">
import { api } from '@/api/client'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'
import { formatDateTime } from '@/utils/format'

// Create / upload / feed screens come in T36.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/suppliers'))
</script>

<template>
  <h1 class="mb-4 text-2xl font-semibold">Постачальники</h1>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <v-table v-if="data">
      <thead>
        <tr>
          <th>Назва</th>
          <th>Дата прайсу</th>
          <th>Фід</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="supplier in data.items" :key="supplier.id">
          <td>{{ supplier.name }}</td>
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
</template>
