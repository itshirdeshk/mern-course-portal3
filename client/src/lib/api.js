const TOKEN_KEY = "learnforge_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const endpoint = path.startsWith("/") ? path : `/${path}`
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: "Unexpected Server Response" }
    }
  }

  if (!res.ok) {
    const err = new Error(data?.error || "Request Failed")
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
