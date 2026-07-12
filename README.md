# Nadeef — Laundry, subscribed

A prototype mobile app for a **subscription laundry pickup & delivery service** in
Kuwait, built from the accompanying lean/phased feasibility study. It pairs the
study's business model (flat monthly membership tiers, free pickup & delivery,
KWD pricing) with an interface styled after the reference screens: dark theme,
red accent, hanging-garment product art, and a schedule-driven basket.

> Prototype only — no backend, payments, or persistence. All data is local mock data.

## What's inside

| Screen | Description |
| --- | --- |
| **Home / Catalog** | Browse items by category (Traditional / Women's / Men's / Household); tap for services |
| **Item detail** | Per-item services (Wash & press, Dry clean, Press only) with quantity steppers |
| **Plans** | The core model — four membership tiers (Basic 15 · Standard 28 · Premium 45 · Family Plus 65 KWD) |
| **Basket** | Address, pick-up & delivery scheduling, contact, hangers toggle, note, live total, checkout |
| **Checkout** | Order confirmation with pick-up / delivery summary |
| **Account** | Membership usage (allowance bar), order history, saved addresses, freeze subscription |

### From the feasibility study
- **Tiers & pricing** (Section 5): Basic / Standard / Premium / Family Plus, with monthly kg caps.
- **Positioning** (Section 3.2): the differentiator is the *flat monthly membership* — no per-order/per-item competitor offers one.
- **Convenience model** (Section 2.1): book a pickup window → driver collects in a branded bag → washed by partner → delivered to the door.

## Tech

- **React 18 + TypeScript + Vite**
- No UI framework — hand-written CSS (`src/styles.css`) and inline SVG art (`src/components/Garment.tsx`, `Icons.tsx`); fully self-contained, no external assets.
- Shared state via a small React context (`src/store.tsx`).

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
  data/        # plans, catalog items & services, time slots (all from the study)
  components/  # Garment SVGs, icon set, Stepper / Toggle / StatusBar
  screens/     # Catalog, ItemDetail, Plans, Basket, Success, Account
  store.tsx    # basket + scheduling + subscription context
  App.tsx      # phone frame, tab navigation
```
