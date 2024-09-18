import { AuthorizationCode } from 'simple-oauth2'
import axios from 'axios'
import { generate_code_challenge, generate_code_verifier } from './pkce'
import {
  client_id,
  redirect_uri,
  base_url,
  authorize_endpoint,
  token_endpoint
} from './config.json'

interface auth_url extends Record<string, string> {
  redirect_uri: string
  scope: string
  state: string
  code_challenge: string
  code_challenge_method: string
}

const random_state_string = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

export const auth_code = new AuthorizationCode({
  client: {
    id: client_id,
    secret: '' // This is empty because we're using PKCE
  },
  auth: {
    tokenHost: base_url,
    authorizePath: authorize_endpoint,
    tokenPath: token_endpoint
  },
  options: {
    bodyFormat: 'form',
    authorizationMethod: 'body'
  }
})

export const get_login_url = (): { auth_url: string; code_verifier: string } => {
  const code_verifier = generate_code_verifier()
  const code_challenge = generate_code_challenge(code_verifier)

  const auth_url = auth_code.authorizeURL({
    redirect_uri,
    scope: `offline_access ${client_id}`,
    state: random_state_string(),
    code_challenge,
    code_challenge_method: 'S256'
  } as auth_url)

  return { auth_url, code_verifier }
}

export interface TokenData {
  access_token: string
  id_token: string
  token_type: string
  not_before: number
  expires_in: number
  expires_on: number
  resource: string
  id_token_expires_in: number
  profile_info: string
  scope: string
  refresh_token: string
  refresh_token_expires_in: number
}

export const refresh_token = async (token: string): Promise<TokenData | null> => {
  const token_params = {
    grant_type: 'refresh_token',
    refresh_token: token,
    client_id
  }

  try {
    const response = await axios.post(`${base_url}${token_endpoint}`, token_params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    console.log('Refreshed token')
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error(error)
    return null
  }
}

const catalog_template = {
  jsonrpc: '2.0',
  method: 'Admin.GetCatalog',
  id: 3120112157
}

export const get_validated_players = async (
  token: string,
  players: Record<string, string>[],
  server: string
): Promise<unknown | null> => {
  const response = await axios.post(
    'https://apim-chivvy.azure-api.net/rpc',
    [
      {
        jsonrpc: '2.0',
        method: 'Validator.Validate',
        params: {
          server_name: server,
          players
        },
        id: 1
      },
      catalog_template
    ],
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (response.data) {
    // return response.data.result.validated_players
    console.log('Validated players')
    console.log(
      response.data[0].result.validated_players.filter(
        (player) => player.playfab_id === '929E11C8D63BE105'
      )
    )
    return response.data
  }

  return null
}

const post_template = {
  jsonrpc: '2.0',
  method: 'Admin.Ban',
  params: {
    playfab_id: '',
    charges: [] as string[],
    ban_time_override: null as number | null
  },
  id: -1
}

export const ban_players = async (
  token: string,
  player_ids: string[],
  ban_charges: string[],
  time_override?: number
): Promise<unknown | null> => {
  const requests = player_ids.map((player_id, index) => {
    const post = { ...post_template }
    post.params.playfab_id = player_id
    post.params.charges = ban_charges
    post.params.ban_time_override = Number(time_override) || null
    post.id = index + 1
    return post
  })

  const response = await axios.post(
    'https://apim-chivvy.azure-api.net/rpc',
    [...requests, catalog_template],
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (response.data) {
    console.log('Banned players')
    console.log(response.data)
    return { data: response.data }
  }

  return null
}

export const get_catalog = async (token: string): Promise<unknown | null> => {
  const response = await axios.post(
    'https://apim-chivvy.azure-api.net/rpc',
    {
      jsonrpc: '2.0',
      method: 'Admin.GetCatalog',
      id: 1
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (response.data) {
    console.log('Catalog')
    console.log(response.data)
    return response.data
  }

  return null
}
