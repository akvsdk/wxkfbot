import axios, { type AxiosProgressEvent } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE || ''
const ADMIN_KEY_STORAGE = 'wxkf_admin_key'

export function getAdminKey(): string {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || ''
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key)
}

const instance = axios.create({ baseURL: BASE_URL })

instance.interceptors.request.use((config) => {
  const key = getAdminKey()
  if (key) config.headers['X-Admin-Key'] = key
  return config
})

instance.interceptors.response.use(
  (res) => {
    const json = res.data
    if (!json.success) {
      const detail = json.details?.error || json.details?.message || ''
      const msg = detail ? `${json.message || '请求失败'}: ${detail}` : (json.message || '请求失败')
      return Promise.reject(new Error(msg))
    }
    return json.data
  },
  (err) => {
    if (err.response?.status === 401) {
      return Promise.reject(new Error('UNAUTHORIZED'))
    }
    const json = err.response?.data
    if (json) {
      const detail = json.details?.error || json.details?.message || ''
      const msg = detail ? `${json.message || '请求失败'}: ${detail}` : (json.message || `请求失败: ${err.response.status}`)
      return Promise.reject(new Error(msg))
    }
    return Promise.reject(err)
  },
)

export const api = {
  get(path: string, options?: { params?: Record<string, string> }) {
    return instance.get(path, { params: options?.params }) as Promise<any>
  },

  post(path: string, body?: any) {
    return instance.post(path, body) as Promise<any>
  },

  upload(path: string, formData: FormData, onProgress?: (percent: number) => void) {
    return instance.post(path, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress(e: AxiosProgressEvent) {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    }) as Promise<any>
  },
}

export function mediaUrl(mediaId: string): string {
  const key = getAdminKey()
  return `${BASE_URL}/kf/media?media_id=${encodeURIComponent(mediaId)}&admin_key=${encodeURIComponent(key)}`
}
