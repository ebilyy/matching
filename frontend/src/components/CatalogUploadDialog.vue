<script setup lang="ts">
import { ref, watch } from 'vue'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useNotificationsStore } from '@/stores/notifications'
import { catalogMapping, catalogUploadForm, checkUploadFile } from '@/utils/catalogUpload'

type Import = components['schemas']['Import']

const emit = defineEmits<{ uploaded: [created: Import] }>()
const open = defineModel<boolean>({ required: true })

const notifications = useNotificationsStore()

const file = ref<File | null>(null)
const skuHeader = ref('Артикул')
const nameHeader = ref('Назва')
const valid = ref(false)
const uploading = ref(false)

watch(open, (isOpen) => {
  if (isOpen) file.value = null
})

const required = (v: string) => v.trim() !== '' || 'Обов’язкове поле'

async function upload() {
  if (!valid.value || !file.value) return
  const chosen = file.value
  uploading.value = true
  try {
    const mapping = catalogMapping(skuHeader.value, nameHeader.value)
    const { data } = await api.POST('/api/v1/catalog/imports', {
      // The contract types `file` as a string; the real File goes in through the serializer.
      body: { file: chosen.name, column_mapping: mapping },
      bodySerializer: (body) => catalogUploadForm(chosen, body.column_mapping),
    })
    if (data) {
      notifications.success('Файл прийнято в обробку')
      emit('uploaded', data)
      open.value = false
    }
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="560" :persistent="uploading">
    <v-card title="Завантажити каталог">
      <v-form v-model="valid" @submit.prevent="upload">
        <v-card-text class="flex flex-col gap-2">
          <v-file-input
            v-model="file"
            label="Файл каталогу *"
            accept=".xlsx,.csv"
            hint="XLSX або CSV, до 50 МБ"
            persistent-hint
            :rules="[checkUploadFile]"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            variant="outlined"
            density="comfortable"
          />
          <p class="mt-2 text-sm text-medium-emphasis">
            Заголовки колонок у файлі. Решта колонок поки ігнорується.
          </p>
          <v-text-field
            v-model="skuHeader"
            label="Колонка артикулу *"
            :rules="[required]"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="nameHeader"
            label="Колонка назви *"
            :rules="[required]"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="uploading" @click="open = false">Скасувати</v-btn>
          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            :loading="uploading"
            :disabled="!valid"
          >
            Завантажити
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
