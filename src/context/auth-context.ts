import { createContext } from 'react'
import type { UserClaims } from '@/lib/api'

export type AuthContextValue = {
  user: UserClaims | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string, code: string) => Promise<void>
  refresh: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
