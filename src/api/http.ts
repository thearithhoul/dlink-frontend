import axios, { AxiosError, type AxiosRequestConfig } from "axios"

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
const baeURL = (import.meta.env.VITE_API_BASE_URL??"").trim()

export const instance = axios.create(
  {
    baseURL: baeURL || undefined,
    timeout: 1000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
)


instance.interceptors.request.use()


export async function requestApi<T>(config: AxiosRequestConfig) {
  try{
    const res = await instance.request<ApiResponse<T>>(config)
    const payload = res.data

    if(!payload?.success){
      throw new ApiError(payload.message ?? 'Request failed', {status: res.status , response: payload})
    }

    return payload.data as T
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