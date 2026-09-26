# fItai Design System — Master

> **LOGIC:** When building a page, first check `design-system/fitai/pages/<page>.md`.
> If it exists, its rules override this file. Otherwise follow this file.
>
> Seeded from `ui-ux-pro-max` (`"fitness tracker AI coach mobile app"`, motion 4, density 5),
> then adapted: the skill's orange/green palette was **rejected** in favour of the
> existing indigo token set, and its Barlow/Barlow pairing was swapped for
> Heebo (Hebrew + body) with Barlow Condensed as the Latin display face.

## 1. Principles

1. **Mobile-first.** Author for 360–390px, enhance at `sm` (576) / `md` (768) / `lg` (992).
   No `max-width` media queries in new code; no `useMediaQuery` for layout that CSS can do.
2. **One thumb.** Primary actions live in the bottom third: bottom nav, sticky action bar, FAB.
3. **RTL is first-class.** Logical properties only (`ms-`, `pe-`, `start-`, `inset-inline-*`).
   Numerals are LTR-isolated via `.tabular-nums` / `.num`.
4. **Tokens, never hexes.** Components read `var(--color-*)` / Tailwind token utilities.

## 2. Color

Source of truth: `src/styles/theme.css` (light default, dark override on
`[data-mantine-color-scheme="dark"]`). Do not add colors outside it.

| Role | Token | Light | Dark |
|---|---|---|---|
| Primary (text/icon) | `--color-primary` | `#4648d4` | `#8385ff` |
| Primary fill | `--color-primary-container` | `#6063ee` | `#2f31a6` |
| Secondary | `--color-secondary` | `#0c7f99` | `#5fd8f0` |
| Tertiary | `--color-tertiary` | `#7a3fc4` | `#c08cff` |
| Background | `--color-background` | `#f8f9fa` | `#0d0e12` |
| Card | `--color-surface-container-low` | `#f2f3f6` | `#14161d` |
| Text | `--color-on-surface` | `#1b1c21` | `#e6e7ea` |
| Muted text | `--color-on-surface-variant` | `#4a4d5c` | `#a2a5b4` |
| Border | `--color-outline-variant` | `#c6c9d4` | `#2e3140` |
| Success / Warning / Danger / Info | `--color-success` … | semantic set | semantic set |

## 3. Typography

- **Body / UI / Hebrew:** Heebo (`--font-sans`), 16px base, line-height 1.5 (1.53 RTL).
- **Display (headings, big numbers):** `--font-display` = `"Barlow Condensed", "Heebo"`.
  Barlow has no Hebrew glyphs, so Hebrew headings fall through to Heebo glyph-by-glyph.
  Use `.font-display` / `.stat-number` (tabular, LTR-isolated).
- **Labels:** IBM Plex Mono eyebrow (`--font-mono`), neutralised in RTL.
- Scale (fluid): `--text-display` clamp(1.75rem→2.5rem), `--text-h1` clamp(1.5rem→2rem),
  `--text-h2` clamp(1.25rem→1.5rem), body 1rem, small 0.875rem, never < 0.75rem.

## 4. Spacing, radius, layout

| Token | Value |
|---|---|
| `--space-1…8` | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px |
| `--page-gutter` | 16px mobile → 24px `md` → 32px `lg` |
| `--tap-min` | 44px (all interactive targets) |
| `--header-h` | 56px mobile / 64px `md` |
| `--bottom-nav-h` | 64px + `env(safe-area-inset-bottom)` |
| Radius | control 8 · card 12 · sheet 20 · pill 999 |

Content max width 1200px; single column on mobile, 2 columns from `md`, dashboards 12-col from `lg`.

## 5. Components

- **Buttons:** min-height 44px (48px for primary CTAs on mobile), full-width in forms/sheets on mobile.
- **Cards:** `SectionCard` — surface-container-low, 1px outline-variant, radius-card, padding 16 → 24 `md`. No hover-lift on touch.
- **Lists vs tables:** `ResponsiveDataList` — cards below `md`, table at `md`+. Never a fixed `min-width` table on mobile.
- **Modals:** full-screen below `sm` (`useMobileModal`), bottom sheet style for pickers.
- **Filters:** `FilterBar` — horizontally scrolling chips, advanced filters in a sheet.
- **Headers:** `PageHeader` — title + subtitle, primary action becomes sticky bottom bar on mobile.
- **Navigation:** bottom nav ≤ 5 slots (4 destinations + More), label + icon, active via color **and** weight. Sidebar from `md`.
- **Empty / loading:** `EmptyState` with icon + one CTA; `.skeleton` shimmer, reserving final size.

## 6. Motion

`--duration-fast 120ms` press, `--duration-base 200ms` state, `--duration-sheet 320ms` sheets.
Easing `--ease-standard`; `--ease-emphasized` only for set completion. Exit faster than enter.
All motion collapses under `prefers-reduced-motion`.

## 7. Anti-patterns

- ❌ Fixed-width containers / tables wider than the viewport
- ❌ Hover-only affordances; icon-only buttons without `aria-label`
- ❌ Emoji as icons (Tabler SVG only)
- ❌ Physical `left/right/ml/mr` in new code
- ❌ Content hidden behind sticky header / bottom nav
- ❌ Raw hex values in components

## 8. Pre-delivery checklist

- [ ] No horizontal scroll at 360px, in LTR and RTL
- [ ] Tap targets ≥ 44px, ≥ 8px apart
- [ ] Contrast ≥ 4.5:1 in light and dark
- [ ] Visible focus ring; keyboard reachable
- [ ] Bottom nav / sticky bars do not cover content (safe-area aware)
- [ ] `inputmode` / `autocomplete` on form fields
- [ ] Reduced motion respected
- [ ] Checked at 390px, 768px, 1280px
