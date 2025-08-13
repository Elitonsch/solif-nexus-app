import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { loginWithEmailPassword, clearAuthTokens, getProfile, getToken, getRefreshToken, setAuthTokens, setProfile } from "@/lib/api"

export type AuthContextValue = {
  token: string | null
  refreshToken: string | null
  name: string
  email: string
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRt] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const t = getToken()
    const rt = getRefreshToken()
    const p = getProfile()
    setToken(t)
    setRt(rt)
    setName(p.nome)
    setEmail(p.email)
    setLoading(false)
  }, [])

  const login = async (email: string, senha: string) => {
    setLoading(true)
    try {
      const data = await loginWithEmailPassword(email, senha)
      setAuthTokens(data.token, data.refreshToken)
      setProfile(data.nome, data.email)
      setToken(data.token)
      setRt(data.refreshToken)
      setName(data.nome)
      setEmail(data.email)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearAuthTokens()
    setToken(null)
    setRt(null)
    setName("")
    setEmail("")
  }

  const value = useMemo<AuthContextValue>(() => ({ token, refreshToken, name, email, loading, login, logout }), [token, refreshToken, name, email, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return ctx
}
