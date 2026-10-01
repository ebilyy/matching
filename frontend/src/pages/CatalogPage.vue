<script setup lang="ts">
import { api } from '@/api/client'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'
import StatCard from '@/components/StatCard.vue'

// Upload wizard comes in T35; the skeleton shows readiness only.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/catalog/readiness'))
</script>

<template>
  <h1 class="mb-4 text-2xl font-semibold">Каталог</h1>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <div v-if="data" class="flex flex-wrap gap-4">
      <StatCard label="Товарів у каталозі" :value="data.own_products_total" />
      <StatCard label="Без штрихкоду й коду виробника" :value="data.without_reliable_code" />
    </div>
  </PageState>
</template>
