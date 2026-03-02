/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_OAUTH_CLIENT_ID?: string
  readonly VITE_API_OAUTH_CALLBACK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
