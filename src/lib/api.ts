export type OutputLoginDTO = {
  id: string
  id_user: string
  nome: string
  email: string
  aparelho?: string
  assentamento?: string
  token: string
  refreshToken: string
}

const API_BASE = "https://solifbackend-development.up.railway.app/solovivo" as const

const STORAGE_KEYS = {
  token: "sv_token",
  refreshToken: "sv_refresh_token",
  name: "sv_user_name",
  email: "sv_user_email",
} as const

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token)
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.refreshToken)
}

export function setAuthTokens(token: string, refreshToken: string) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}

export function clearAuthTokens() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
}

export function setProfile(nome?: string, email?: string) {
  if (nome) localStorage.setItem(STORAGE_KEYS.name, nome)
  if (email) localStorage.setItem(STORAGE_KEYS.email, email)
}

export function getProfile() {
  return {
    nome: localStorage.getItem(STORAGE_KEYS.name) || "",
    email: localStorage.getItem(STORAGE_KEYS.email) || "",
  }
}

async function doRefresh(): Promise<{ token: string; refreshToken: string } | null> {
  const rt = getRefreshToken()
  if (!rt) return null
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { token: string; refreshToken: string }
  setAuthTokens(data.token, data.refreshToken)
  return data
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: any
  headers?: Record<string, string>
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const doFetch = async () =>
    fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

  let res = await doFetch()

  if (res.status === 401) {
    const refreshed = await doRefresh()
    if (!refreshed) throw new Error("Não autenticado")
    // retry with new token
    const retryHeaders = {
      ...headers,
      Authorization: `Bearer ${refreshed.token}`,
    }
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers: retryHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Erro ${res.status}`)
  }

  // try parse json
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    return (await res.json()) as T
  }
  return (await res.text()) as unknown as T
}

export async function loginWithEmailPassword(email: string, senha: string) {
  // Assumindo que a API espera parâmetros via querystring no GET
  const url = new URL(`${API_BASE}/usuario`)
  url.searchParams.set("email", email)
  url.searchParams.set("senha", senha)
  const res = await fetch(url.toString(), { method: "GET" })
  if (!res.ok) throw new Error("Falha no login")
  const data = (await res.json()) as OutputLoginDTO
  setAuthTokens(data.token, data.refreshToken)
  setProfile(data.nome, data.email)
  return data
}

export const api = {
  get: <T,>(path: string) => apiRequest<T>(path),
  post: <T,>(path: string, body: any) => apiRequest<T>(path, { method: "POST", body }),
  put: <T,>(path: string, body: any) => apiRequest<T>(path, { method: "PUT", body }),
  del: <T,>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
}
