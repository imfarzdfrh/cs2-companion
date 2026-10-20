import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
export default defineNuxtPlugin(() => {
  if (!Capacitor.isNativePlatform()) return
  const router = useRouter()
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) router.back()
    else App.minimizeApp()
  })
  App.addListener('appUrlOpen', ({ url }) => {
    if (url === 'cs2companion://open/notifications') router.push('/notifications')
  })
})
