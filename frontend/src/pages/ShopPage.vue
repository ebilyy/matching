<script setup lang="ts">
import { ref, watch } from 'vue'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { useCursorList } from '@/composables/useCursorList'
import { useLoad } from '@/composables/useLoad'
import NameDialog, { type NameSubmitResult } from '@/components/NameDialog.vue'
import PageState from '@/components/PageState.vue'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDateTime } from '@/utils/format'

type Manager = components['schemas']['Manager']

const props = defineProps<{ shopId: string }>()

const notifications = useNotificationsStore()
const path = () => ({ shop_id: props.shopId })

const shop = useLoad(() => api.GET('/api/v1/shops/{shop_id}', { params: { path: path() } }))
const managers = useCursorList((after?: string) =>
  api.GET('/api/v1/shops/{shop_id}/managers', { params: { path: path(), query: { after } } }),
)
watch(
  () => props.shopId,
  () => Promise.all([shop.reload(), managers.reload()]),
)

const renamingShop = ref(false)
const managerDialog = ref(false)
// `null` = adding a manager; a manager = renaming that one.
const editedManager = ref<Manager | null>(null)

async function renameShop(name: string): Promise<NameSubmitResult> {
  const { data, error } = await api.PATCH('/api/v1/shops/{shop_id}', {
    params: { path: path() },
    body: { name },
  })
  if (!data) return { saved: false, details: error?.details }
  shop.data.value = data
  notifications.success('Зміни збережено')
  return { saved: true }
}

function openManagerDialog(manager: Manager | null) {
  editedManager.value = manager
  managerDialog.value = true
}

async function saveManager(display_name: string): Promise<NameSubmitResult> {
  const manager = editedManager.value
  const { data, error } = manager
    ? await api.PATCH('/api/v1/shops/{shop_id}/managers/{manager_id}', {
        params: { path: { ...path(), manager_id: manager.id } },
        body: { display_name },
      })
    : await api.POST('/api/v1/shops/{shop_id}/managers', {
        params: { path: path() },
        body: { display_name },
      })
  if (!data) return { saved: false, details: error?.details }
  managers.upsert(data, (item) => item.id)
  notifications.success(manager ? 'Зміни збережено' : 'Менеджера додано')
  return { saved: true }
}
</script>

<template>
  <v-btn :to="{ name: 'shops' }" variant="text" prepend-icon="mdi-arrow-left" class="mb-2 -ml-4">
    Магазини
  </v-btn>

  <PageState :loading="shop.loading.value" :failed="shop.failed.value" @retry="shop.reload">
    <template v-if="shop.data.value">
      <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-2xl font-semibold">{{ shop.data.value.name }}</h1>
        <v-btn prepend-icon="mdi-pencil" variant="tonal" @click="renamingShop = true">
          Перейменувати
        </v-btn>
      </div>
      <p class="mb-6 text-sm opacity-70">
        Створено {{ formatDateTime(shop.data.value.created_at) }}
      </p>

      <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-lg font-semibold">Менеджери</h2>
        <v-btn prepend-icon="mdi-account-plus" variant="text" @click="openManagerDialog(null)">
          Додати менеджера
        </v-btn>
      </div>
      <p class="mb-3 text-sm opacity-70">
        Ім’я менеджера видно в історії зіставлень. Доступи до системи тут не налаштовуються.
      </p>
      <PageState
        :loading="managers.loading.value"
        :failed="managers.failed.value"
        @retry="managers.reload"
      >
        <v-table density="compact">
          <thead>
            <tr>
              <th>Ім’я</th>
              <th>Додано</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-if="managers.items.value.length === 0">
              <td colspan="3" class="py-6 text-center opacity-70">Менеджерів ще немає.</td>
            </tr>
            <tr v-for="manager in managers.items.value" :key="manager.id">
              <td>{{ manager.display_name }}</td>
              <td>{{ formatDateTime(manager.created_at) }}</td>
              <td class="text-right">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  :aria-label="`Перейменувати ${manager.display_name}`"
                  @click="openManagerDialog(manager)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-if="managers.nextCursor.value" class="mt-4 flex justify-center">
          <v-btn variant="tonal" :loading="managers.loadingMore.value" @click="managers.loadMore">
            Показати ще
          </v-btn>
        </div>
      </PageState>

      <NameDialog
        v-model="renamingShop"
        title="Перейменувати магазин"
        label="Назва магазину *"
        field="name"
        :initial="shop.data.value.name"
        submit-text="Зберегти"
        :submit="renameShop"
      />
      <NameDialog
        v-model="managerDialog"
        :title="editedManager ? 'Перейменувати менеджера' : 'Новий менеджер'"
        label="Ім’я *"
        field="display_name"
        :initial="editedManager?.display_name"
        :submit-text="editedManager ? 'Зберегти' : 'Додати'"
        :submit="saveManager"
      />
    </template>
  </PageState>
</template>
