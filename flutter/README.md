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

- **Theme & palette** (`lib/theme.dart`) — accent, per-plan colours
  (Family Plus = teal, Max = green), per-group tile tints.
- **Models** (`lib/models.dart`) — Plan, ItemCategory, AddOn, Garment,
  GarmentGroup.
- **Data** — the item-based plans (`data/plans.dart`), item categories +
  add-ons + overage (`data/items.dart`), and the **full garment catalogue**
  (`data/garments.dart`, ~180 items, EN/AR + piece counts).
- **State** (`lib/state.dart`) — `AppState` (ChangeNotifier via `provider`):
  active plan, monthly items used, add pickup selection.
- **Drawn garment icons** (`widgets/garment_icon.dart`) — a `CustomPainter`
  port of the SVG icon set (dishdasha, abaya, bisht, ghutra, cap, egal, …).
- **Screens**
  - Home (`screens/home_screen.dart`) — membership hero + "how items are
    counted" card.
  - Plans (`screens/plans_screen.dart`) — item-allowance plan cards with the
    teal/green theming.
  - Pickup (`screens/pickup_screen.dart`) — schedule details + the "what are
    you sending?" card.
  - Garment picker (`widgets/garment_picker.dart`) — searchable grouped
    steppers → **review step** (itemised list + big total) → **Proceed to
    checkout** (records the pieces against the monthly counter).

## Not yet ported

- POS terminal and staff/admin portal.
- Supabase auth, onboarding/welcome, rewards, tracking/map, notifications.
- Full EN/AR i18n + RTL (Arabic strings are in the data; the UI is EN for now).
- Admin-editable config (localStorage equivalents → shared_preferences / backend).
