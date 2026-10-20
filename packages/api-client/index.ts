export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
export function createApi(base: string, csrf: () => string = () => '') {
  return async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(base.replace(/\/+$/, '') + path, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf() },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    // Some successful requests have no body (204); error proxies may return plain text.
    const payload = await response.text()
    let data: unknown = null
    if (payload) {
      try {
        data = JSON.parse(payload)
      } catch {
        if (response.ok) throw new ApiError(response.status, 'Invalid server response')
      }
    }
    if (!response.ok) {
      const detail =
        data && typeof data === 'object' && 'detail' in data
          ? (data as { detail?: unknown }).detail
          : undefined
      throw new ApiError(response.status, typeof detail === 'string' ? detail : 'Request failed')
    }
    return data as T
  }
}
