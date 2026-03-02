/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TIMEOUT_MS?: string
  readonly VITE_API_WITH_CREDENTIALS?: string
  readonly VITE_AUTH_TOKEN_KEY?: string
  readonly VITE_REFRESH_TOKEN_KEY?: string
  readonly VITE_REFRESH_TOKEN_PATH?: string
  readonly VITE_GOOGLE_AUTHORIZE_URL_PATH?: string
  readonly VITE_GOOGLE_CALLBACK_PATH?: string
  readonly VITE_AUTH_ME_PATH?: string
  readonly VITE_AUTH_USERINFO_PATH?: string
  readonly VITE_SET_SUBDOMAIN_PATH?: string
  readonly VITE_SET_SUBDOMAIN_FALLBACK_PATH?: string
  readonly VITE_PUBLIC_BASE_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
