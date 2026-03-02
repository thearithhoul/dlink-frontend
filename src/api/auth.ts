import { ApiError, requestApi } from "./http"
import type { AddUserDomainRequest, AuthorizationResponse, CallbackRequest, TokenModel, TokenUserModel } from "./model/auth_model"

const authMePath = "/auth/me"
const authUserInfoPath = "/auth/userinfo"



export async function oauthAuthorize() {
  try{
    const authorizePath = "/auth/google/authorize-url"
    const data = await requestApi<AuthorizationResponse>({
      method:"GET",
      url: authorizePath
    })
    
    return data;
  }catch(error){

     if (error instanceof ApiError) {
          throw new Error(error.message)
        }
    
        throw error
  }
}

export async function oauthCallback(payload: CallbackRequest) {
   try{
    const callbackPath = "/auth/google/callback"
    const data = await requestApi<TokenModel>({
      method:"POST",
      url: callbackPath,
      data:payload
    })
    
    return data;
  }catch(error){

     if (error instanceof ApiError) {
          throw new Error(error.message)
        }
        throw error
  }
}


export async function AddUserDomain(payload: AddUserDomainRequest) {
    try{
    const addDomainPath = "/auth/me/domain"
    const data = await requestApi<TokenUserModel>({
      method:"PATCH",
      url: addDomainPath,
      data :payload
    })
    
    return data;
  }catch(error){

     if (error instanceof ApiError) {
          throw new Error(error.message)
        }
    
	    throw error
	  }
}

export async function getCurrentUser() {
  try {
    const data = await requestApi<TokenUserModel>({
      method: "GET",
      url: authMePath,
    })

    if (!data) {
      throw new Error("User profile is missing from response.")
    }

    return data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const data = await requestApi<TokenUserModel>({
        method: "GET",
        url: authUserInfoPath,
      })

      if (!data) {
        throw new Error("User profile is missing from fallback response.")
      }

      return data
    }

    if (error instanceof ApiError) {
      throw new Error(error.message)
    }

    throw error
  }
}

export async function setCurrentUserSubdomain(subdomain: string) {
  const normalizedSubdomain = subdomain.trim().toLowerCase()

  if (!normalizedSubdomain) {
    throw new Error("Subdomain is required.")
  }

  return AddUserDomain({ domain: normalizedSubdomain })
}
