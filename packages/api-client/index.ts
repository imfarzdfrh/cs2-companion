export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function createApi(
  base: string,
  csrf: () => string = () => '',
  timeoutMs = 15000
) {
  return async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const url = base.replace(/\/+$/, '') + (path.startsWith('/') ? path : '/' + path)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf() },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })

      const payload = await response.text()
      let data: unknown = null

      if (payload) {
        try {
          data = JSON.parse(payload)
        } catch {
          if (response.ok) {
            throw new ApiError(response.status, 'The server returned an invalid response')
          }
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
    } finally {
      clearTimeout(timeout)
    }
  }
}
