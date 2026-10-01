<script setup lang="ts">
defineProps<{ loading: boolean; failed: boolean }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <v-progress-linear v-if="loading" indeterminate />
  <v-alert v-else-if="failed" type="warning" variant="tonal" class="my-4">
    Не вдалося завантажити дані.
    <template #append>
      <v-btn variant="text" @click="$emit('retry')">Повторити</v-btn>
    </template>
  </v-alert>
  <slot v-else />
</template>
