# Pressd — Laundry, subscribed

A prototype mobile app for a **subscription laundry pickup & delivery service** in
Kuwait, built from the accompanying lean/phased feasibility study. Members pay a
flat monthly price for a laundry allowance (in kg) and simply **schedule a
pickup** — no per-item selection. Styled after the reference screens: dark theme,
**light-blue** accent, KWD pricing, and a schedule-driven flow. Fully bilingual
(**English / العربية**) with right-to-left support.

> Prototype only — no backend, payments, or persistence. All data is local mock data.

## Live app

Deployed via GitHub Pages at **https://malmutawa1.github.io/cry/** — auto-redeploys
on every push through `.github/workflows/deploy.yml`.

**One-time setup** (repo owner): go to **Settings → Pages → Build and deployment**
and set **Source: GitHub Actions**. The next push (or a manual run of the
"Deploy to GitHub Pages" workflow under the Actions tab) publishes the site.

## What's inside

| Screen | Description |
| --- | --- |
| **Home** | Greeting, active-membership card with monthly allowance bar, "Schedule a pickup" CTA, and a How-it-works walkthrough |
| **Plans** | The core model — four membership tiers (Basic 15 · Standard 28 · Premium 45 · Family Plus 65 KWD) with monthly kg caps |
| **Pickup** | Address, pick-up & delivery scheduling, contact, hangers toggle, note, and confirm — covered by the subscription (no basket) |
| **Confirmation** | Pickup confirmed with pick-up / delivery / plan summary |
| **Account** | Membership usage, **language toggle**, order history, saved addresses, payment, freeze subscription |

### Language

Tap the **globe** icon on Home, or **Language** in Account, to switch between
English and Arabic. The whole UI re-renders and flips to RTL, including the
navigation bar, cards, dividers, badges, and chevrons.

### From the feasibility study
- **Tiers & pricing** (Section 5): Basic / Standard / Premium / Family Plus, with monthly kg caps.
- **Positioning** (Section 3.2): the differentiator is the *flat monthly membership* — no per-order/per-item competitor offers one.
- **Convenience model** (Section 2.1): book a pickup window → driver collects in a branded bag → washed by partner → delivered to the door.

## Tech

- **React 18 + TypeScript + Vite**
- No UI framework — hand-written CSS (`src/styles.css`) and inline SVG icons; fully self-contained, no external assets.
- Shared state via a small React context (`src/store.tsx`); i18n via `src/i18n.tsx` (en/ar dictionaries + RTL).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Build a production bundle:

```bash
npm run build    # type-checks then bundles to dist/
npm run preview
```

## Project layout

```
src/
  data/        # plans (bilingual) & time slots (from the study)
  components/  # icon set, StatusBar / Toggle
  screens/     # Home, Plans, Pickup, Success, Account
  i18n.tsx     # language context + en/ar translations + direction
  store.tsx    # scheduling + subscription context
  App.tsx      # phone frame, tab navigation, RTL wiring
```
