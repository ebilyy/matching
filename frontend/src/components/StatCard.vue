<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

<template>
  <v-card variant="tonal" class="min-w-48">
    <v-card-text>
      <div class="text-sm opacity-70">{{ label }}</div>
      <div class="text-3xl font-semibold">{{ value }}</div>
    </v-card-text>
  </v-card>
</template>
