// Native (Capacitor) integration. Everything here is a no-op on the web, so the
// same bundle runs unchanged in the browser (GitHub Pages) and inside the iOS
// app. Guard every native call with `isNative`.
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const isNative = Capacitor.isNativePlatform()

/** Run once on app start: flag the shell as native and dismiss the splash. */
export async function initNative(): Promise<void> {
  if (!isNative) return
  document.documentElement.classList.add('native')
  const shell = document.querySelector('.app-shell')
  if (shell) shell.setAttribute('data-native', 'true')
  // Give the first frame a moment to paint, then reveal the app.
  window.setTimeout(() => {
    SplashScreen.hide().catch(() => {})
  }, 150)
}

/**
 * Match the native status-bar text colour to the current theme.
 * Style.Dark = light icons (for dark backgrounds); Style.Light = dark icons.
 */
export function setStatusBarTheme(dark: boolean): void {
  if (!isNative) return
  StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {})
}

/** Light haptic tap — call on meaningful button presses. No-op on web. */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (!isNative) return
  const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }
  Haptics.impact({ style: map[style] }).catch(() => {})
}
