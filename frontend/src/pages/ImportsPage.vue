<script setup lang="ts">
import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'
import { formatDateTime } from '@/utils/format'

const statusLabels: Record<components['schemas']['ImportStatus'], string> = {
  queued: 'у черзі',
  processing: 'обробляється',
  applied: 'застосовано',
  rejected: 'відхилено',
  awaiting_mapping: 'потрібне зіставлення колонок',
}

// Issues and mapping confirmation come in T36.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/imports'))
</script>

<template>
  <h1 class="mb-4 text-2xl font-semibold">Імпорти</h1>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <v-table v-if="data">
      <thead>
        <tr>
          <th>Створено</th>
          <th>Тип</th>
          <th>Файл</th>
          <th>Статус</th>
          <th>Розпізнано</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data.items" :key="item.id">
          <td>{{ formatDateTime(item.created_at) }}</td>
          <td>{{ item.kind === 'catalog' ? 'каталог' : 'прайс' }}</td>
          <td>{{ item.original_filename ?? (item.source === 'feed' ? 'фід' : '—') }}</td>
          <td>{{ statusLabels[item.status] }}</td>
          <td>{{ item.rows_recognized ?? '—' }}</td>
        </tr>
      </tbody>
    </v-table>
  </PageState>
</template>
