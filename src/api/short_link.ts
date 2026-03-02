import http from '@/api/http'
import type { ApiResponse } from '@/api/model/api_response'
import type { ShortLinks ,CreateShortLinkPayload } from '@/api/model/short_links_model'



export const getShortLinks = async (limit: number, page: number): Promise<ShortLinks[]> => {
  const { data } = await http.get<ApiResponse<ShortLinks[]>>('/v1/links', {
    params: {
      limit,
      page,
    },
  })

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch short links')
  }

  return data.data
}

export const createShortLink = async (payload: CreateShortLinkPayload): Promise<ShortLinks> => {
  const { data } = await http.post<ApiResponse<ShortLinks>>('/v1/links/add', payload)

  if (!data.success) {
    throw new Error(data.message || 'Failed to create short link')
  }

  return data.data
}
