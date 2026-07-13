export type User = {
  id: number
  email: string
  created_at: string
}

export type AuthResponse = {
  access_token: string
  token_type: 'bearer'
  user: User
}

export type AuthPayload = {
  email: string
  password: string
}
