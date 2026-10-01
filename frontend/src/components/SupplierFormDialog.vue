<script setup lang="ts">
import { ref, watch } from 'vue'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useNotificationsStore } from '@/stores/notifications'
import { fieldErrors } from '@/utils/fieldErrors'
import {
  emptySupplierForm,
  supplierFields,
  supplierRules,
  supplierToForm,
  toCreatePayload,
  toUpdatePayload,
  type SupplierField,
} from '@/utils/supplierForm'

type Supplier = components['schemas']['Supplier']

// Without `supplier` the dialog creates one; with it, edits that supplier.
const props = defineProps<{ supplier?: Supplier }>()
const emit = defineEmits<{ saved: [supplier: Supplier] }>()
const open = defineModel<boolean>({ required: true })

const notifications = useNotificationsStore()

const form = ref(emptySupplierForm())
const serverErrors = ref<Partial<Record<SupplierField, string>>>({})
const valid = ref(false)
const saving = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) return
  form.value = props.supplier ? supplierToForm(props.supplier) : emptySupplierForm()
  serverErrors.value = {}
})

// A server-side message is stale as soon as the user edits that field.
function clearServerError(field: SupplierField) {
  if (serverErrors.value[field]) serverErrors.value = { ...serverErrors.value, [field]: undefined }
}

async function save() {
  if (!valid.value) return
  saving.value = true
  try {
    const { data, error } = props.supplier
      ? await patch(props.supplier)
      : await api.POST('/api/v1/suppliers', { body: toCreatePayload(form.value) })
    if (data) {
      notifications.success(props.supplier ? 'Зміни збережено' : 'Постачальника додано')
      emit('saved', data)
      open.value = false
    } else if (error) {
      serverErrors.value = fieldErrors(error.details, supplierFields)
    }
  } finally {
    saving.value = false
  }
}

async function patch(supplier: Supplier) {
  const body = toUpdatePayload(form.value, supplier)
  // Nothing changed: the contract rejects an empty patch, and there is nothing to send anyway.
  if (Object.keys(body).length === 0) return { data: supplier, error: undefined }
  return api.PATCH('/api/v1/suppliers/{supplier_id}', {
    params: { path: { supplier_id: supplier.id } },
    body,
  })
}

const fields: {
  key: Exclude<SupplierField, 'description'>
  label: string
  type?: string
  hint?: string
}[] = [
  { key: 'name', label: 'Назва *' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Телефон', type: 'tel' },
  { key: 'website', label: 'Сайт', type: 'url' },
  {
    key: 'feed_url',
    label: 'Адреса фіду',
    type: 'url',
    hint: 'Публічне посилання на прайс. Його забиратимуть щодня й за кнопкою «Забрати зараз».',
  },
]
</script>

<template>
  <v-dialog v-model="open" max-width="560" :persistent="saving">
    <v-card :title="supplier ? 'Редагувати постачальника' : 'Новий постачальник'">
      <v-form v-model="valid" @submit.prevent="save">
        <v-card-text class="flex flex-col gap-2">
          <v-text-field
            v-for="field in fields"
            :key="field.key"
            v-model="form[field.key]"
            :label="field.label"
            :type="field.type ?? 'text'"
            :hint="field.hint"
            :rules="supplierRules[field.key]"
            :error-messages="serverErrors[field.key]"
            :autofocus="field.key === 'name'"
            variant="outlined"
            density="comfortable"
            @update:model-value="clearServerError(field.key)"
          />
          <v-textarea
            v-model="form.description"
            label="Опис"
            :error-messages="serverErrors.description"
            variant="outlined"
            density="comfortable"
            rows="3"
            auto-grow
            @update:model-value="clearServerError('description')"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="saving" @click="open = false">Скасувати</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="saving" :disabled="!valid">
            {{ supplier ? 'Зберегти' : 'Додати' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
