import { spawnSync } from 'node:child_process'

const base = process.env.NUXT_PUBLIC_API_BASE
const demoOnly = process.env.CS2_ANDROID_DEMO_ONLY === '1'
let url
try {
  url = new URL(base || '')
} catch {
  console.error('Set NUXT_PUBLIC_API_BASE to a reachable HTTPS backend before packaging Android.')
  process.exit(1)
}
const hostname = url.hostname.toLowerCase()
const reserved = hostname === 'localhost' || hostname === '127.0.0.1' ||
  hostname === '[::1]' || hostname.endsWith('.invalid') || hostname.endsWith('.example')
if (url.protocol !== 'https:' || !hostname || (reserved && !demoOnly)) {
  console.error('Android builds require a reachable HTTPS API. Reserved placeholder domains are demo-only.')
  process.exit(1)
}
if (demoOnly && url.href !== 'https://cs2-companion.example.invalid/') {
  console.error('Demo-only packaging requires the non-routable demo endpoint.')
  process.exit(1)
}
if (demoOnly) console.warn('DEMO-ONLY APK: live sign-in, FACEIT and provider data are unavailable.')
for (const args of [
  ['--filter', '@cs2/mobile', 'build'],
  ['--filter', '@cs2/mobile', 'exec', 'cap', 'sync', 'android'],
]) {
  const result = spawnSync('pnpm', args, { stdio: 'inherit', env: process.env })
  if (result.status !== 0) process.exit(result.status || 1)
}
