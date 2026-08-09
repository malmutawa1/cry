# Pressd — Flutter port

A Flutter (Dart) port of the Pressd customer app. This lives alongside the
original React/Vite web app (in the repo root) so the live web build keeps
working; this folder is a standalone Flutter project.

## Run

```bash
cd flutter
flutter pub get
flutter run          # device / emulator
flutter run -d chrome  # web
```

Requires the Flutter SDK (3.19+). It is **not** installed in the CI
environment, so this code has not been compiled/verified here — run
`flutter analyze` locally before relying on it.

## What's ported (customer core)

- **Bilingual i18n + RTL** (`lib/i18n.dart`) — `LocaleState` with EN/AR strings,
  a language toggle, and full right-to-left mirroring (via a `Directionality`
  wrapper in `main.dart`). Plan / garment / group names switch language too.
- **Supabase auth** (`supabase_flutter`, `lib/supabase_config.dart`) — real
  email/password **sign-in + sign-up** with session restore + auth-state
  listening; Welcome splash → Auth → app shell. "Continue with Apple" is a
  local demo relay (like the web app).
- **Order tracking** (`screens/track_screen.dart`) — a live staged timeline
  (Order received → … → Delivered) advancing on a timer, with ETA + driver
  card. An order is created on pickup checkout.
- **Rewards** (`screens/rewards_screen.dart`, `data/rewards.dart`) — points,
  tier progress, ways to earn, redeemable rewards (earned on checkout).
- **Theme & palette** (`lib/theme.dart`) — accent, per-plan colours
  (Family Plus = teal, Max = green), per-group tile tints.
- **Models** (`lib/models.dart`) + **data** — item-based plans
  (`data/plans.dart`), item categories/add-ons/overage (`data/items.dart`), and
  the **full garment catalogue** (`data/garments.dart`, ~180 items, EN/AR +
  piece counts).
- **State** (`lib/state.dart`) — `AppState` (ChangeNotifier via `provider`):
  user/sign-in, active plan, monthly items used, add pickup selection.
- **Drawn garment icons** (`widgets/garment_icon.dart`) — a `CustomPainter`
  port of the SVG icon set (dishdasha, abaya, bisht, ghutra, cap, egal, …).
- **Screens** — Home (membership hero + counting-rule card), Plans (item
  allowance cards with teal/green theming), Pickup (schedule + "what are you
  sending?"), Account (profile, usage, language toggle, sign out), and the
  Garment picker → **review** → **Proceed to checkout** flow.

## Not yet ported

- POS terminal and staff/admin portal.
- Live map on tracking, notifications bell, privacy/T&C consent, address picker.
- Admin-editable config (localStorage → shared_preferences / backend).
- Entrance/interaction animations (the web app's pops/floats).
