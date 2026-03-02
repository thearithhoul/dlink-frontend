export interface TokenUserModel {
  id: string
  email: string
  full_name: string | null
  given_name: string | null
  family_name: string | null
  avatar_url: string | null
  google_sub: string | null
  domain: string | null
  is_active: boolean
  is_email_verified: boolean
  create_at: string
  update_at: string
}

export interface TokenModel {
  access_token: string
  refresh_token?: string | null
  refresh_expires_in: string | null
  token_type: string
  expires_in: number
  user: TokenUserModel
}