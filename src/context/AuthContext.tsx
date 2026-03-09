import { useEffect, useMemo, useState } from 'react'
import { TOKEN_KEY, clearToken, login as apiLogin, me } from '../lib/api'
import type { UserClaims } from '../lib/api'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserClaims | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t) {
      setToken(t)
      me()
        .then(setUser)
        .catch(() => {
          clearToken()
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (email: string, password: string, code: string) => {
    const tok = await apiLogin({ email, password, code })
    setToken(tok)
    const u = await me()
    setUser(u)
  }

  const refresh = async () => {
    const u = await me()
    setUser(u)
  }

  const logout = () => {
    clearToken()
    setToken(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      login: handleLogin,
      refresh,
      logout,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
