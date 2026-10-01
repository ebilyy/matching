/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the api; empty = same origin (see .env.development). Paths already carry `/api/v1`. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
