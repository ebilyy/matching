import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import App from '../App.vue'
import router from '../router'
import vuetify from '../plugins/vuetify'

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
// The landing page fetches on mount; the call itself is covered in client.spec.ts.
vi.stubGlobal(
  'fetch',
  vi.fn(() => new Promise(() => {})),
)

describe('App', () => {
  it('renders the nav sections', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [createPinia(), router, vuetify] } })

    const titles = wrapper.findAll('.v-list-item-title').map((item) => item.text())
    expect(titles).toEqual(['Каталог', 'Постачальники', 'Імпорти', 'Черга', 'Огляд', 'Магазини'])
    expect(router.currentRoute.value.name).toBe('catalog')
  })
})
