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

test('A successful empty response does not cause a JSON parsing error', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await createApi('https://api.test/')('/v1/favorites/amber', 'DELETE'), null)
})
test('A non-JSON server failure becomes a safe API error', async () => {
  globalThis.fetch = async () => new Response('gateway offline', { status: 502 })
  await assert.rejects(
    () => createApi('https://api.test')('/v1/stats'),
    (e: unknown) => e instanceof ApiError && e.status === 502 && e.message === 'Request failed'
  )
})
