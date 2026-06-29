const BASE_URL = import.meta.env.VITE_API_BASE || ''

const ADMIN_KEY_STORAGE = 'wxkf_admin_key'

export function getAdminKey(): string {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || ''
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key)
}

class ApiClient {
  private base: string

  constructor(base: string) {
    this.base = base
  }

  private async request(method: string, path: string, body?: any, params?: Record<string, string>) {
    let url = `${this.base}${path}`
    if (params) {
      const qs = new URLSearchParams(params).toString()
      url += `?${qs}`
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const key = getAdminKey()
    if (key) headers['X-Admin-Key'] = key

    const options: RequestInit = { method, headers }
    if (body) options.body = JSON.stringify(body)

    const res = await fetch(url, options)
    const json = await res.json()

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED')
    }
    if (!res.ok || !json.success) {
      const detail = json.details?.error || json.details?.message || ''
      const msg = detail ? `${json.message || '请求失败'}: ${detail}` : (json.message || `请求失败: ${res.status}`)
      throw new Error(msg)
    }
    return json.data
  }

  get(path: string, options?: { params?: Record<string, string> }) {
    return this.request('GET', path, undefined, options?.params)
  }

  post(path: string, body?: any) {
    return this.request('POST', path, body)
  }

  async upload(path: string, formData: FormData) {
    const url = `${this.base}${path}`
    const headers: Record<string, string> = {}
    const key = getAdminKey()
    if (key) headers['X-Admin-Key'] = key

    const res = await fetch(url, { method: 'POST', headers, body: formData })
    const json = await res.json()

    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok || !json.success) {
      const detail = json.details?.error || json.details?.message || ''
      const msg = detail ? `${json.message || '上传失败'}: ${detail}` : (json.message || `上传失败: ${res.status}`)
      throw new Error(msg)
    }
    return json.data
  }
}

export const api = new ApiClient(BASE_URL)
