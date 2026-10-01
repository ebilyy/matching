<script setup lang="ts">
import { api } from '@/api/client'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'

// Decisions, explanations and bulk confirm come in T37.
const { data, loading, failed, reload } = useLoad(() => api.GET('/api/v1/match-proposals'))
</script>

<template>
  <h1 class="mb-4 text-2xl font-semibold">Черга підтвердження</h1>
  <PageState :loading="loading" :failed="failed" @retry="reload">
    <v-table v-if="data">
      <thead>
        <tr>
          <th>Наш товар</th>
          <th>Позиція постачальника</th>
          <th>Постачальник</th>
          <th class="text-right">Впевненість</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="proposal in data.items"
          :key="`${proposal.own_product.id}/${proposal.supplier_position.id}`"
        >
          <td>{{ proposal.own_product.name }}</td>
          <td>{{ proposal.supplier_position.name }}</td>
          <td>{{ proposal.supplier_position.supplier.name }}</td>
          <td class="text-right" :class="{ 'text-orange-600': proposal.is_low_confidence }">
            {{ proposal.confidence.toFixed(3) }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </PageState>
</template>
