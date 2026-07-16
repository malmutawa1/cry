import type { CapacitorConfig } from '@capacitor/cli'

// NOTE: `appId` must match the Bundle ID you register in your Apple Developer
// account / App Store Connect. Change it to your own reverse-domain id before
// submitting (e.g. com.yourcompany.pressd).
const config: CapacitorConfig = {
  appId: 'com.pressd.app',
  appName: 'Pressd',
  webDir: 'dist',
  backgroundColor: '#0b0b0d',
  ios: {
    // Let the web content flow under the status bar; we pad with safe-area insets.
    contentInset: 'never',
    backgroundColor: '#0b0b0d',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: false, // hidden from JS once the app has mounted
      backgroundColor: '#0b0b0d',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'native',
    },
  },
}

export default config
