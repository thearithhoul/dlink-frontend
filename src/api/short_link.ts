import { ApiError, requestApi } from "./http"
import type {
  CreateShortLinkPayload,
  DeleteShortLinkParams,
  ShortLink,
} from "./model/short_links_model"



export async function getShortLink(limit: number = 20, page: number = 1): Promise<ShortLink[]> {
    const shortLinksPath = "/links/"

  try {
    const data = await requestApi<ShortLink[]>({
      url: shortLinksPath,
      method: "GET",
      params: { limit, page },
    })

    return data ?? []
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }

    throw error
  }
}

export async function createShortLink(payload: CreateShortLinkPayload): Promise<ShortLink> {

  const addshortLinksPath = "/links/add"
  try {
    const data = await requestApi<ShortLink>({
      method: "POST",
      url: addshortLinksPath,
      data: payload,
    })

    if (!data) {
      throw new Error("Empty response from create short link API.")
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }

    throw error
  }
}

export async function getShortLinkById(id: string): Promise<ShortLink> {
  const normalizedId = id.trim()
  const shortLinkInfo = "/links/info/"
  if (!normalizedId) {
    throw new Error("Short link id is required.")
  }

  try {
    const data = await requestApi<ShortLink>({
      method: "GET",
      url: shortLinkInfo + id ,
     
    })

    if (!data) {
      throw new Error("Short link not found.")
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }

    throw error
  }
}

export async function deleteShortLink(payload: DeleteShortLinkParams): Promise<void> {
  const id = payload.id.trim()
  const shortLinkDelectPath = "/links/delect"

  if (!id) {
    throw new Error("Short link id is required.")
  }

  try {
    await requestApi<unknown>({
      method: "POST",
      url: shortLinkDelectPath,
      data:payload
    })
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message)
    }

    throw error
  }
}

export const getShortLinks = getShortLink
