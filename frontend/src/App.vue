<script setup lang="ts">
import { ref } from 'vue'

import AppToasts from '@/components/AppToasts.vue'
import DevTokenField from '@/components/DevTokenField.vue'
import { navRoutes } from '@/router'

const drawer = ref<boolean | null>(null)
</script>

<template>
  <v-app>
    <v-app-bar flat border="b">
      <v-app-bar-nav-icon class="lg:hidden" @click="drawer = !drawer" />
      <v-app-bar-title>Зіставлення товарів</v-app-bar-title>
      <template #append>
        <DevTokenField class="mr-2" />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list nav>
        <v-list-item
          v-for="route in navRoutes"
          :key="route.name"
          :to="{ name: route.name }"
          :prepend-icon="route.meta.icon"
          :title="route.meta.title"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>

    <AppToasts />
  </v-app>
</template>
