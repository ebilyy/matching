<script setup lang="ts">
import { api } from '@/api/client'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'
import StatCard from '@/components/StatCard.vue'
import { formatPercent } from '@/utils/format'

// Offers and history per product come in T38.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/coverage'))
</script>

<template>
  <h1 class="mb-4 text-2xl font-semibold">Огляд</h1>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <div v-if="data" class="flex flex-wrap gap-4">
      <StatCard label="Покриття каталогу" :value="formatPercent(data.coverage_ratio)" />
      <StatCard label="Зіставлено товарів" :value="data.matched_own_products" />
      <StatCard label="Усього товарів" :value="data.own_products_total" />
      <StatCard label="Чекають підтвердження" :value="data.pending_proposals" />
    </div>
  </PageState>
</template>
