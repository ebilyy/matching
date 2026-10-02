<script setup lang="ts">
import { ref } from 'vue'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useLoad } from '@/composables/useLoad'
import CatalogUploadDialog from '@/components/CatalogUploadDialog.vue'
import PageState from '@/components/PageState.vue'
import { formatDateTime } from '@/utils/format'

type Import = components['schemas']['Import']

const statusLabels: Record<components['schemas']['ImportStatus'], string> = {
  queued: 'у черзі',
  processing: 'обробляється',
  applied: 'застосовано',
  rejected: 'відхилено',
  awaiting_mapping: 'потрібне зіставлення колонок',
}

// Issues and mapping confirmation come in T36.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/imports'))

const uploadOpen = ref(false)
const lastUploaded = ref<Import>()

function onUploaded(created: Import) {
  lastUploaded.value = created
  void reload()
}
</script>

<template>
  <div class="mb-4 flex items-center gap-4">
    <h1 class="text-2xl font-semibold">Імпорти</h1>
    <v-spacer />
    <v-btn color="primary" prepend-icon="mdi-upload" @click="uploadOpen = true">
      Завантажити каталог
    </v-btn>
  </div>

  <v-alert
    v-if="lastUploaded"
    type="success"
    variant="tonal"
    class="mb-4"
    closable
    @click:close="lastUploaded = undefined"
  >
    Файл «{{ lastUploaded.original_filename }}» прийнято. ID імпорту:
    <code>{{ lastUploaded.id }}</code>
  </v-alert>

  <PageState :loading="loading" :failed="failed" @retry="reload">
    <v-table v-if="data">
      <thead>
        <tr>
          <th>Створено</th>
          <th>Тип</th>
          <th>Файл</th>
          <th>Статус</th>
          <th>Розпізнано</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in data.items"
          :key="item.id"
          :class="{ 'bg-green-lighten-5': item.id === lastUploaded?.id }"
        >
          <td>{{ formatDateTime(item.created_at) }}</td>
          <td>{{ item.kind === 'catalog' ? 'каталог' : 'прайс' }}</td>
          <td>{{ item.original_filename ?? (item.source === 'feed' ? 'фід' : '—') }}</td>
          <td>{{ statusLabels[item.status] }}</td>
          <td>{{ item.rows_recognized ?? '—' }}</td>
          <td class="font-mono text-xs">{{ item.id }}</td>
        </tr>
        <tr v-if="data.items.length === 0">
          <td colspan="6" class="text-center text-medium-emphasis">Імпортів ще немає</td>
        </tr>
      </tbody>
    </v-table>
  </PageState>

  <CatalogUploadDialog v-model="uploadOpen" @uploaded="onUploaded" />
</template>
