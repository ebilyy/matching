import createClient, { type Middleware } from 'openapi-fetch'

import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import type { components, paths } from './schema'

/** RFC 9457 problem details with the project's extension members (SAD §8). */
export type Problem = components['schemas']['Error']

export function isProblem(body: unknown): body is Problem {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Problem).code === 'string' &&
    typeof (body as Problem).message === 'string'
  )
}

// Placeholder auth until SAD §11 settles the credential scheme: a token typed in the app bar.
const auth: Middleware = {
  onRequest({ request }) {
    const { token } = useAuthStore()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
}

// Every failed call surfaces as a toast; screens still get `error` back to render their own state.
const problemToast: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return
    const body: unknown = await response
      .clone()
      .json()
      .catch(() => null)
    useNotificationsStore().error(
      isProblem(body) ? body.message : `Запит завершився з помилкою ${response.status}`,
    )
  },
  onError() {
    useNotificationsStore().error('Сервер недоступний. Перевірте з’єднання й повторіть.')
  },
}

// Same origin: Caddy (prod) or the Vite proxy (dev) forward /api to the backend.
export const api = createClient<paths>({ baseUrl: location.origin })
api.use(auth, problemToast)
