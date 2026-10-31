import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createApi, ApiError } from '../packages/api-client/index.ts'
const original = globalThis.fetch
afterEach(() => {
  globalThis.fetch = original
})
test('API includes credentials and CSRF without exposing keys', async () => {
  globalThis.fetch = async (input, init) => {
    assert.equal(input, 'https://api.test/v1/settings')
    assert.equal(init?.credentials, 'include')
    assert.equal((init?.headers as Record<string, string>)['X-CSRF-Token'], 'nonce')
    assert.equal(init?.body, '{"theme":"dark"}')
    return new Response('{"ok":true}', { status: 200 })
  }
  assert.deepEqual(
    await createApi('https://api.test', () => 'nonce')('/v1/settings', 'PUT', { theme: 'dark' }),
    { ok: true }
  )
})
test('Provider errors remain errors; never fall back to sample data', async () => {
  globalThis.fetch = async () =>
    new Response('{"detail":"FACEIT is not configured"}', { status: 503 })
  await assert.rejects(
    () => createApi('https://api.test')('/v1/stats'),
    (e: unknown) =>
      e instanceof ApiError && e.status === 503 && e.message === 'FACEIT is not configured'
  )
})
test('Structured validation errors receive safe UI message', async () => {
  globalThis.fetch = async () => new Response('{"detail":[{"msg":"invalid"}]}', { status: 422 })
  await assert.rejects(() => createApi('https://api.test')('/v1/settings'), /Request failed/)
})


test('successful empty responses are accepted and base URLs are normalized', async () => {
  globalThis.fetch = async (input) => {
    assert.equal(input, 'https://api.test/v1/favorites/amber')
    return new Response(null, { status: 204 })
  }
  assert.equal(await createApi('https://api.test///')('v1/favorites/amber', 'DELETE'), null)
})

test('non-JSON gateway failures become predictable API errors', async () => {
  globalThis.fetch = async () => new Response('upstream unavailable', { status: 502 })
  await assert.rejects(
    () => createApi('https://api.test')('/v1/stats'),
    (error: unknown) =>
      error instanceof ApiError && error.status === 502 && error.message === 'Request failed'
  )
})

test('invalid successful JSON responses are not silently accepted', async () => {
  globalThis.fetch = async () => new Response('<html>proxy error</html>', { status: 200 })
  await assert.rejects(
    () => createApi('https://api.test')('/v1/me'),
    (error: unknown) =>
      error instanceof ApiError && error.status === 200 && error.message.includes('invalid response')
  )
})
