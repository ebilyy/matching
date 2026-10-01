<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { token } = storeToRefs(useAuthStore())
</script>

<template>
  <v-text-field
    v-model.trim="token"
    class="max-w-72"
    label="Токен (dev)"
    prepend-inner-icon="mdi-key-variant"
    type="password"
    density="compact"
    variant="outlined"
    hide-details
    clearable
    autocomplete="off"
  />
</template>
