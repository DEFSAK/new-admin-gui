import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { jwtDecode } from 'jwt-decode'
import { TokenData } from './auth'

const TOKEN_PATH = join(app.getPath('userData'), 'tokens.json')

export interface SavedTokenData {
  access_token: string
  access_token_expires_on: number
  refresh_token: string
  refresh_token_expires_on: number
}

export function getTokens(): SavedTokenData | null {
  try {
    const data = readFileSync(TOKEN_PATH, 'utf8')
    return JSON.parse(data)
  } catch (_) {
    return null
  }
}

export function saveTokens(token_data: TokenData): void {
  writeFileSync(
    TOKEN_PATH,
    JSON.stringify({
      access_token: token_data.access_token,
      access_token_expires_on: Date.now() + token_data.expires_in * 1000,
      refresh_token: token_data.refresh_token,
      refresh_token_expires_on: Date.now() + token_data.refresh_token_expires_in * 1000
    })
  )
}

interface DecodedAccessToken {
  aud: string
  iss: string
  exp: number
  nbf: number
  idp: string
  sub: string
  name: string
  extension_PlayFab: string
  tid: string
  azp: string
  ver: string
  iat: number
}

export function getDecodedAccessToken(): DecodedAccessToken | null {
  const tokens = getTokens()
  if (!tokens) return null

  return jwtDecode(tokens.access_token)
}

export function isAccessTokenExpired(): boolean {
  const tokens = getTokens()
  if (!tokens?.access_token) return true
  return Date.now() >= tokens.access_token_expires_on
}
