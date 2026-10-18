import { spawnSync } from 'node:child_process'
const base=process.env.NUXT_PUBLIC_API_BASE
if(!base || !base.startsWith('https://') || ['localhost','127.0.0.1','::1'].includes(new URL(base).hostname)) {
  console.error('Set NUXT_PUBLIC_API_BASE to a reachable HTTPS backend before packaging Android.'); process.exit(1)
}
for(const args of [['--filter','@cs2/mobile','build'],['--filter','@cs2/mobile','exec','cap','sync','android']]) {
 const result=spawnSync('pnpm',args,{stdio:'inherit',env:process.env})
 if(result.status!==0)process.exit(result.status||1)
}
