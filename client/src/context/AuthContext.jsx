import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { api, setToken, getToken } from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    try {
      const { user } = await api("/auth/me")
      setUser(user)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = useCallback(async (email, password) => {
    const { token, user } = await api("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    })
    setToken(token)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { token, user } = await api("/auth/register", {
      method: "POST",
      auth: false,
      body: { name, email, password },
    })
    setToken(token)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth Must Be Used Within AuthProvider")
  return ctx
}
