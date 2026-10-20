export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
export function createApi(base: string, csrf: () => string = () => '') {
  return async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await fetch(base + path, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf() },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    const data = await response.json()
    if (!response.ok)
      throw new ApiError(
        response.status,
        typeof data.detail === 'string' ? data.detail : 'Request failed'
      )
    return data as T
  }
}
