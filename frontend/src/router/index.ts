import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const navRoutes = [
  {
    path: '/catalog',
    name: 'catalog',
    component: () => import('@/pages/CatalogPage.vue'),
    meta: { title: 'Каталог', icon: 'mdi-package-variant-closed' },
  },
  {
    path: '/suppliers',
    name: 'suppliers',
    component: () => import('@/pages/SuppliersPage.vue'),
    meta: { title: 'Постачальники', icon: 'mdi-truck-outline' },
  },
  {
    path: '/imports',
    name: 'imports',
    component: () => import('@/pages/ImportsPage.vue'),
    meta: { title: 'Імпорти', icon: 'mdi-file-upload-outline' },
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('@/pages/ReviewQueuePage.vue'),
    meta: { title: 'Черга', icon: 'mdi-playlist-check' },
  },
  {
    path: '/coverage',
    name: 'coverage',
    component: () => import('@/pages/CoveragePage.vue'),
    meta: { title: 'Огляд', icon: 'mdi-chart-donut' },
  },
  {
    path: '/shops',
    name: 'shops',
    component: () => import('@/pages/ShopsPage.vue'),
    meta: { title: 'Магазини', icon: 'mdi-storefront-outline' },
  },
] satisfies RouteRecordRaw[]

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'catalog' } },
    ...navRoutes,
    {
      path: '/suppliers/:supplierId',
      name: 'supplier',
      component: () => import('@/pages/SupplierPage.vue'),
      props: true,
      meta: { title: 'Постачальник' },
    },
    {
      path: '/shops/:shopId',
      name: 'shop',
      component: () => import('@/pages/ShopPage.vue'),
      props: true,
      meta: { title: 'Магазин' },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'catalog' } },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Зіставлення товарів` : 'Зіставлення товарів'
})

export default router
