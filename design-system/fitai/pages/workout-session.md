# Workout session — overrides

> Overrides `../MASTER.md`. This is the in-gym, one-handed, sweaty-fingers screen.

- **Density:** low. Tap targets **56px** (not 44) for set/rep/weight controls and set-complete.
- **Layout:** one exercise in focus at a time; exercise list collapsible above.
  Sticky bottom bar: rest timer + "complete set" primary button, safe-area aware.
  The global bottom nav is hidden on this route to give the bar the thumb zone.
- **Numbers:** weight/reps in `.stat-number` at ≥ 28px; steppers (−/+) either side, `inputmode="decimal"`.
- **Feedback:** `.animate-set-pop` on completion + haptic-free visual check; no toasts that cover the bar.
- **Charts (StrengthCurve):** full width, 180px tall on mobile.
- **Avoid:** modals for per-set edits (use inline expansion or a bottom sheet).
