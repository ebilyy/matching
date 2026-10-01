<script setup lang="ts">
import { ref, watch } from 'vue'

import { fieldErrors } from '@/utils/fieldErrors'

// One required name field: create or rename a shop or a manager. The caller does the request
// and hands back the problem `details` on failure, so a 422 shows under the field.
export type NameSubmitResult = { saved: true } | { saved: false; details?: unknown }

const props = defineProps<{
  title: string
  label: string
  /** Body key the server reports violations against (`name`, `display_name`). */
  field: string
  initial?: string
  submitText: string
  submit: (value: string) => Promise<NameSubmitResult>
}>()
const open = defineModel<boolean>({ required: true })

const value = ref('')
const serverError = ref<string>()
const valid = ref(false)
const saving = ref(false)

// Limit mirrors openapi.yaml (ShopCreate.name, ManagerCreate.display_name: VARCHAR(200)).
const rules = [
  (v: string) => v.trim() !== '' || 'Вкажіть назву',
  (v: string) => v.trim().length <= 200 || 'Не більше 200 символів',
]

watch(open, (isOpen) => {
  if (!isOpen) return
  value.value = props.initial ?? ''
  serverError.value = undefined
})

async function save() {
  if (!valid.value) return
  const trimmed = value.value.trim()
  if (trimmed === props.initial) {
    open.value = false
    return
  }
  saving.value = true
  try {
    const result = await props.submit(trimmed)
    if (result.saved) open.value = false
    else serverError.value = fieldErrors(result.details, [props.field])[props.field]
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="440" :persistent="saving">
    <v-card :title="title">
      <v-form v-model="valid" @submit.prevent="save">
        <v-card-text>
          <v-text-field
            v-model="value"
            :label="label"
            :rules="rules"
            :error-messages="serverError"
            variant="outlined"
            density="comfortable"
            autofocus
            @update:model-value="serverError = undefined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="saving" @click="open = false">Скасувати</v-btn>
          <v-btn type="submit" color="primary" variant="flat" :loading="saving" :disabled="!valid">
            {{ submitText }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
