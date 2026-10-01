<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useNotificationsStore } from '@/stores/notifications'

const { queue } = storeToRefs(useNotificationsStore())
</script>

<template>
  <v-snackbar-queue v-model="queue" location="bottom right" closable />
</template>
