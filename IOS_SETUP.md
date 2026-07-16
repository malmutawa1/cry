# Publishing Pressd to the App Store (no Mac required)

Pressd is a web app wrapped as a native iOS app with **Capacitor**, and built &
signed in the cloud with **Codemagic** — so you never need a Mac or Xcode.

## What's already set up in this repo

- Capacitor is installed and configured (`capacitor.config.ts`).
- The native iOS project lives in `ios/` (committed).
- `npm run build:ios` builds the web bundle with a **relative asset base** (so
  it loads from inside the app), and `npm run cap:sync` copies it into iOS.
- Native niceties: splash screen auto-hides on launch, the status bar follows
  the app theme, the shell goes full-bleed and respects the notch/home
  indicator, and a `haptic()` helper is available (see `src/native.ts`).
- `codemagic.yaml` builds, signs, and uploads to TestFlight on every push.

## One-time accounts

1. **Apple Developer Program** — enroll at <https://developer.apple.com/programs/> ($99/year).
2. **Codemagic** — sign up at <https://codemagic.io> (free tier includes 500 macOS build-minutes/month) and connect this GitHub repo.

## Step 1 — Choose your Bundle ID

Pick a reverse-domain id, e.g. `com.yourcompany.pressd`. Then:

- In **App Store Connect** → Certificates, IDs & Profiles, register that Bundle ID.
- Create the **app record** in App Store Connect (My Apps → +). Note its numeric
  **Apple ID** (shown in App Information).
- In this repo, set the same id in **two** places:
  - `capacitor.config.ts` → `appId`
  - `codemagic.yaml` → `ios_signing.bundle_identifier`
  - and put the numeric Apple ID in `codemagic.yaml` → `APP_STORE_APPLE_ID`.

## Step 2 — App Store Connect API key (for signing + upload)

1. App Store Connect → Users and Access → **Integrations / Keys** → generate an
   **App Store Connect API key** (Admin or App Manager role). Download the `.p8`.
2. In **Codemagic** → Teams/Integrations → add an **App Store Connect** integration
   with that key. Give it a name and put that name in `codemagic.yaml` under
   `integrations.app_store_connect` (default here: `CodemagicASC`).

Codemagic uses this key to fetch signing certificates/profiles automatically —
no manual certificate wrangling.

## Step 3 — App icon & splash (required for release)

The build works today with placeholder art, but the store requires a real icon.
Provide a **1024×1024 PNG logo** (no transparency) at `assets/icon.png` and a
`assets/splash.png` (2732×2732), then run once locally or in CI:

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --ios
```

This generates every required icon/splash size into `ios/`.

## Step 4 — Build

Push to the branch Codemagic is watching (or press **Start new build** in the
Codemagic UI). The pipeline will:

1. `npm ci`
2. `npm run build:ios && npx cap sync ios`
3. fetch signing profiles, bump the build number
4. archive → export a signed `.ipa`
5. upload to **TestFlight**

Install **TestFlight** on your iPhone to test the build. When happy, either flip
`submit_to_app_store: true` in `codemagic.yaml`, or submit the build for review
from App Store Connect.

## Before you can pass App Store review

- **Backend must be live** — deploy Supabase (`claude /mcp` → authenticate →
  `supabase db push`) and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- **Account deletion** — Apple requires an in-app "delete my account" option
  (the app has sign-up). Ask me to add it.
- **Privacy** — you need a privacy-policy URL and to fill Apple's privacy
  questionnaire. (Sign in with Apple is already implemented ✅.)
- **Payments** — laundry is a physical service, so KNET/Apple Pay/cards are
  allowed; Apple's in-app-purchase cut does **not** apply.
- **Store listing** — name, subtitle, description, keywords, screenshots (per
  device size), support URL.

## Local commands

| Command | What it does |
| --- | --- |
| `npm run build` | Web build for GitHub Pages (base `/cry/`) — unchanged |
| `npm run build:ios` | Web build with relative base for the native app |
| `npm run cap:sync` | Build web + copy into the iOS project |
| `npx cap open ios` | Open the project in Xcode (Mac only — optional) |
