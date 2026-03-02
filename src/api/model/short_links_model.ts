
export interface ShortLink {
  id: string
  code: string
  web_url: string
  android_url: string
  ios_url: string
  android_store_url: string
  ios_store_url: string
  default_url: string
  is_active: boolean
  expire_at: string | null
  create_at: string
}




export interface CreateShortLinkPayload {
  default_url: string
  android_store_url?: string
  ios_store_url?: string
  android_url?: string
  ios_url?: string
  expires_at: string
}

export interface DeleteShortLinkParams {
  id: string
}

