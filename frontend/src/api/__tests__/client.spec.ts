import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

// openapi-fetch captures globalThis.fetch when the client is created, so stub it before importing.
const fetchMock = vi.fn<typeof fetch>()
vi.stubGlobal('fetch', fetchMock)
const { api } = await import('../client')

function json(body: unknown, status: number, contentType = 'application/json') {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } })
}

describe('api client', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
  })

  it('sends the dev token as a bearer credential', async () => {
    useAuthStore().token = 'dev-token'
    fetchMock.mockResolvedValue(json({ own_products_total: 1, without_reliable_code: 0 }, 200))

    await api.GET('/api/v1/catalog/readiness')

    const request = fetchMock.mock.calls[0]![0] as Request
    expect(request.headers.get('Authorization')).toBe('Bearer dev-token')
  })

  it('toasts the problem+json message on failure', async () => {
    fetchMock.mockResolvedValue(
      json(
        { code: 'supplier.not_found', message: 'Постачальника не знайдено', status: 404 },
        404,
        'application/problem+json',
      ),
    )

    const { error } = await api.GET('/api/v1/suppliers/{supplier_id}', {
      params: { path: { supplier_id: '0199a3c1-5e6f-7b20-8c31-4d5e6f708192' } },
    })

    expect(error?.code).toBe('supplier.not_found')
    expect(useNotificationsStore().queue).toEqual([
      { text: 'Постачальника не знайдено', color: 'error' },
    ])
  })

  it('falls back to the status when the body is not a problem', async () => {
    fetchMock.mockResolvedValue(new Response('Bad Gateway', { status: 502 }))

    await api.GET('/api/v1/coverage')

    expect(useNotificationsStore().queue[0]?.text).toBe('Запит завершився з помилкою 502')
  })

  it('toasts when the server is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(api.GET('/api/v1/coverage')).rejects.toThrow('Failed to fetch')

    expect(useNotificationsStore().queue[0]?.text).toMatch(/Сервер недоступний/)
  })
})
