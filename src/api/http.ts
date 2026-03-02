import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios"

export type ApiResponse<T> = {success: boolean
  message: string,
  data: T | null
}

export class ApiError extends Error {
  response?: ApiResponse<unknown>
  status?: number

  constructor(message: string , opts?: {status?: number ; response?: ApiResponse<unknown>}){
    super(message)
    this.name = "ApiError"
    this.status = opts?.status
    this.response = opts?.response
  }

}

const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const AUTH_REFRESH_PATH = "/auth/google/refresh"

type AuthRetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const getStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}

export const setAccessToken = (token: string) => {
  const normalizedToken = token.trim()
  if (!normalizedToken) return
  getStorage()?.setItem(ACCESS_TOKEN_KEY, normalizedToken)
}

export const getAccessToken = () => getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null

export const clearAccessToken = () => {
  getStorage()?.removeItem(ACCESS_TOKEN_KEY)
}

export const hasAccessToken = () => {
  const token = getAccessToken()
  return typeof token === "string" && token.trim().length > 0
}

export const setRefreshToken = (token: string) => {
  const normalizedToken = token.trim()
  if (!normalizedToken) return
  getStorage()?.setItem(REFRESH_TOKEN_KEY, normalizedToken)
}

export const getRefreshToken = () => getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null

export const clearRefreshToken = () => {
  getStorage()?.removeItem(REFRESH_TOKEN_KEY)
}

export const clearAuthTokens = () => {
  clearAccessToken()
  clearRefreshToken()
}

const hasRefreshToken = () => {
  const token = getRefreshToken()
  return typeof token === "string" && token.trim().length > 0
}

const isSkipAuthRequest = (config?: AxiosRequestConfig) => {
  if (!config?.headers) return false
  const headers = config.headers as Record<string, unknown>
  const skipAuth = headers["X-Skip-Auth"]
  return skipAuth === "true" || skipAuth === true || skipAuth === "1" || skipAuth === 1
}

const removeSkipAuthHeader = (config: AxiosRequestConfig) => {
  if (!config.headers) return
  const headers = config.headers as Record<string, unknown>
  delete headers["X-Skip-Auth"]
}

const setAuthorizationHeader = (config: AxiosRequestConfig, token: string) => {
  if (!config.headers) {
    config.headers = {}
  }

  const headers = config.headers as Record<string, unknown>
  headers.Authorization = `Bearer ${token}`
}

type RefreshTokenPayload = {
  access_token: string
  refresh_token?: string | null
}

const parseRefreshTokenPayload = (payload: unknown): RefreshTokenPayload | null => {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const record = payload as Record<string, unknown>

  if ("success" in record && "data" in record) {
    return parseRefreshTokenPayload(record.data)
  }

  if (typeof record.access_token !== "string" || !record.access_token.trim()) {
    return null
  }

  const refreshToken =
    typeof record.refresh_token === "string"
      ? record.refresh_token.trim()
      : record.refresh_token === null
        ? null
        : undefined

  return {
    access_token: record.access_token.trim(),
    refresh_token: refreshToken,
  }
}

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").trim() || "http://localhost:8000/api/v1"

export const instance = axios.create(
  {
    baseURL,
    timeout: 10000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
)

let refreshRequest: Promise<string> | null = null

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()

  if (!refreshToken?.trim()) {
    throw new Error("Refresh token is missing.")
  }

  const { data } = await axios.post(
    AUTH_REFRESH_PATH,
    { refresh_token: refreshToken.trim() },
    {
      baseURL,
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
  )

  const tokenPayload = parseRefreshTokenPayload(data)

  if (!tokenPayload) {
    throw new Error("Invalid refresh token response.")
  }

  setAccessToken(tokenPayload.access_token)

  if (typeof tokenPayload.refresh_token === "string" && tokenPayload.refresh_token) {
    setRefreshToken(tokenPayload.refresh_token)
  } else if (tokenPayload.refresh_token === null) {
    clearRefreshToken()
  }

  return tokenPayload.access_token
}

instance.interceptors.request.use((config) => {
  if (isSkipAuthRequest(config)) {
    removeSkipAuthHeader(config)
    return config
  }

  const accessToken = getAccessToken()

  if (accessToken?.trim()) {
    setAuthorizationHeader(config, accessToken.trim())
  }

  return config
})

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AuthRetryRequestConfig | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401 || originalRequest._retry || isSkipAuthRequest(originalRequest)) {
      return Promise.reject(error)
    }

    if (!hasRefreshToken()) {
      clearAuthTokens()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshRequest) {
        refreshRequest = refreshAccessToken().finally(() => {
          refreshRequest = null
        })
      }

      const newAccessToken = await refreshRequest
      setAuthorizationHeader(originalRequest, newAccessToken)
      return instance.request(originalRequest)
    } catch (refreshError) {
      clearAuthTokens()
      return Promise.reject(refreshError)
    }
  },
)


export async function requestApi<T>(config: AxiosRequestConfig): Promise<T | null> {
  try{
    const res = await instance.request<ApiResponse<T>>(config)
    const payload = res.data

    if(!payload?.success){
      throw new ApiError(payload?.message ?? 'Request failed', {status: res.status , response: payload})
    }

    return payload.data
  }
  catch(err)
  {
    if(!axios.isAxiosError(err)) throw err
    const axiosErr = err as AxiosError<ApiResponse<unknown>>
    const status = axiosErr.response?.status
    const payload = axiosErr.response?.data
    throw new ApiError(payload?.message ?? axiosErr.message, {status, response: payload})
  }
}

export default instance
