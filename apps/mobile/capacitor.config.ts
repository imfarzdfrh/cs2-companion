import type { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.cs2companion.app',
  appName: 'CS2 Companion',
  webDir: '.output/public',
  android: { allowMixedContent: false },
}
export default config
