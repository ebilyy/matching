<script setup lang="ts">
import { ref, watch } from 'vue'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useLoad } from '@/composables/useLoad'
import PageState from '@/components/PageState.vue'
import SupplierFormDialog from '@/components/SupplierFormDialog.vue'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{ supplierId: string }>()

const roleLabels: Record<components['schemas']['ColumnRole'], string> = {
  sku: 'Артикул',
  name: 'Назва',
  barcode: 'Штрихкод',
  manufacturer_code: 'Код виробника',
  brand: 'Бренд',
  category: 'Категорія',
  supplier_code: 'Код постачальника',
  price: 'Ціна',
  in_stock: 'Наявність',
  stock_quantity: 'Залишок',
}

// Price upload and "fetch now" come in T36.
const { data, loading, failed, reload } = useLoad(() =>
  api.GET('/api/v1/suppliers/{supplier_id}', {
    params: { path: { supplier_id: props.supplierId } },
  }),
)
watch(() => props.supplierId, reload)

const editing = ref(false)

// PATCH answers with the full supplier, so the card updates without a refetch.
function onSaved(supplier: components['schemas']['Supplier']) {
  data.value = supplier
}
</script>

<template>
  <v-btn
    :to="{ name: 'suppliers' }"
    variant="text"
    prepend-icon="mdi-arrow-left"
    class="mb-2 -ml-4"
  >
    Постачальники
  </v-btn>

  <PageState :loading="loading" :failed="failed" @retry="reload">
    <template v-if="data">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-2xl font-semibold">{{ data.name }}</h1>
        <v-btn prepend-icon="mdi-pencil" variant="tonal" @click="editing = true">Редагувати</v-btn>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <v-card variant="outlined" title="Контакти">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-email-outline" title="Email">
              <v-list-item-subtitle>
                <a v-if="data.email" :href="`mailto:${data.email}`">{{ data.email }}</a>
                <span v-else>—</span>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-phone-outline" title="Телефон">
              <v-list-item-subtitle>
                <a v-if="data.phone" :href="`tel:${data.phone}`">{{ data.phone }}</a>
                <span v-else>—</span>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-web" title="Сайт">
              <v-list-item-subtitle>
                <a
                  v-if="data.website"
                  :href="data.website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ data.website }}
                </a>
                <span v-else>—</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text v-if="data.description" class="whitespace-pre-line pt-0">
            {{ data.description }}
          </v-card-text>
        </v-card>

        <v-card variant="outlined" title="Прайс">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-calendar-clock" title="Дата чинного прайсу">
              <v-list-item-subtitle>
                {{ formatDateTime(data.price_date) }}
                <v-chip v-if="data.is_price_stale" color="warning" size="x-small" class="ml-2">
                  застарілий
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-rss" title="Фід">
              <v-list-item-subtitle class="break-all">
                {{ data.feed_url ?? 'не налаштовано' }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item prepend-icon="mdi-clock-plus-outline" title="Додано">
              <v-list-item-subtitle>{{ formatDateTime(data.created_at) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </div>

      <h2 class="mb-2 mt-6 text-lg font-semibold">Запам’ятоване зіставлення колонок</h2>
      <v-table v-if="data.column_mapping" density="compact">
        <thead>
          <tr>
            <th>Колонка у файлі</th>
            <th>Значення</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(column, index) in data.column_mapping.columns" :key="index">
            <td>{{ column.header }}</td>
            <td :class="{ 'opacity-60': !column.role }">
              {{ column.role ? roleLabels[column.role] : 'не використовується' }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <p v-else class="opacity-70">З’явиться після першого застосованого прайсу.</p>

      <SupplierFormDialog v-model="editing" :supplier="data" @saved="onSaved" />
    </template>
  </PageState>
</template>
