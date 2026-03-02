import http from '@/api/http'
import axios from 'axios'
import type { ApiResponse } from '@/api/model/api_response'
import type { TokenModel, TokenUserModel } from '@/api/model/token_model'

const DEFAULT_GOOGLE_AUTHORIZE_URL_PATH = '/v1/auth/google/authorize-url'
const DEFAULT_GOOGLE_CALLBACK_PATH = '/v1/auth/google/callback'
const DEFAULT_AUTH_ME_PATH = '/v1/auth/me'
const DEFAULT_AUTH_USERINFO_PATH = '/v1/auth/userinfo'
const DEFAULT_SET_SUBDOMAIN_PATH = '/v1/auth/me/domain'
const DEFAULT_SET_SUBDOMAIN_FALLBACK_PATH = '/v1/auth/domain'
const googleAuthorizeUrlPath =
  import.meta.env.VITE_GOOGLE_AUTHORIZE_URL_PATH || DEFAULT_GOOGLE_AUTHORIZE_URL_PATH
const googleCallbackPath = import.meta.env.VITE_GOOGLE_CALLBACK_PATH || DEFAULT_GOOGLE_CALLBACK_PATH
const authMePath = import.meta.env.VITE_AUTH_ME_PATH || DEFAULT_AUTH_ME_PATH
const authUserInfoPath = import.meta.env.VITE_AUTH_USERINFO_PATH || DEFAULT_AUTH_USERINFO_PATH
const setSubdomainPath = import.meta.env.VITE_SET_SUBDOMAIN_PATH || DEFAULT_SET_SUBDOMAIN_PATH
const setSubdomainFallbackPath =
  import.meta.env.VITE_SET_SUBDOMAIN_FALLBACK_PATH || DEFAULT_SET_SUBDOMAIN_FALLBACK_PATH

export interface GoogleAuthorizeUrlResponse {
  authorization_url: string
}

export const getGoogleAuthorizationUrl = async (): Promise<string> => {
  const { data } = await http.get<GoogleAuthorizeUrlResponse>(googleAuthorizeUrlPath, {
    headers: {
      'X-Skip-Auth': 'true',
    },
  })

  const authorizationUrl = data?.authorization_url?.trim()

  if (!authorizationUrl) {
    throw new Error('Authorization URL is missing from backend response.')
  }

  return authorizationUrl
}

interface GoogleCallbackPayload {
  code: string
  state?: string | null
}

export const exchangeGoogleCallbackCode = async ({
  code,
  state,
}: GoogleCallbackPayload): Promise<TokenModel> => {
  const normalizedCode = code.trim()
  const normalizedState = state?.trim()

  if (!normalizedCode) {
    throw new Error('Authorization code is required.')
  }

  const { data } = await http.get<TokenModel>(googleCallbackPath, {
    params: {
      code: normalizedCode,
      ...(normalizedState ? { state: normalizedState } : {}),
    },
    headers: {
      'X-Skip-Auth': 'true',
    },
  })

  const accessToken = data?.access_token?.trim()

  if (!accessToken) {
    throw new Error('Access token is missing from backend callback response.')
  }

  return {
    ...data,
    access_token: accessToken,
  }
}

export const getCurrentUser = async (): Promise<TokenUserModel> => {
  try {
    const { data } = await http.get<TokenUserModel>(authMePath)
    return data
  } catch (error) {
    const shouldFallbackToUserInfo =
      axios.isAxiosError(error) &&
      error.response?.status === 404 &&
      authUserInfoPath !== authMePath

    if (!shouldFallbackToUserInfo) {
      throw error
    }

    const { data } = await http.get<TokenUserModel>(authUserInfoPath)
    return data
  }
}

type UserPayloadResponse = TokenUserModel | ApiResponse<TokenUserModel>

const parseUserPayload = (payload: UserPayloadResponse): TokenUserModel => {
  if ('success' in payload) {
    if (!payload.success || !payload.data) {
      throw new Error(payload.message || 'Failed to update subdomain.')
    }

    return payload.data
  }

  return payload
}

const requestSetSubdomain = async (path: string, subdomain: string): Promise<TokenUserModel> => {
  const { data } = await http.patch<UserPayloadResponse>(path, { domain: subdomain })
  return parseUserPayload(data)
}

export const setCurrentUserSubdomain = async (subdomain: string): Promise<TokenUserModel> => {
  const normalizedSubdomain = subdomain.trim().toLowerCase()

  if (!normalizedSubdomain) {
    throw new Error('Subdomain is required.')
  }

  try {
    return await requestSetSubdomain(setSubdomainPath, normalizedSubdomain)
  } catch (error) {
    const shouldFallback =
      axios.isAxiosError(error) &&
      error.response?.status === 404 &&
      setSubdomainFallbackPath !== setSubdomainPath

    if (!shouldFallback) {
      throw error
    }

    return requestSetSubdomain(setSubdomainFallbackPath, normalizedSubdomain)
  }
}
