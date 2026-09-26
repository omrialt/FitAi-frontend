# Dashboard — overrides

> Overrides `../MASTER.md`. Only deviations are listed.

- **Layout:** mobile = single column feed in priority order:
  greeting + today's action card → 2-col stat grid → active plans → progress chart.
  `md` = 2 columns; `lg` = 12-col grid (main 8 / side 4).
- **Hero action:** "today's workout" card is the first element, full-bleed CTA (48px),
  duplicated by the bottom-nav FAB.
- **Stats:** `StatCard` with `.stat-number` (display face, tabular), label beneath, trend chip.
  2 per row on mobile, 4 per row from `lg`. Never fixed widths.
- **Charts:** fill container width, height 200px mobile / 260px `md`, no legend on mobile
  when single series.
- **Guest (LandingHero):** hero → 3 feature cards (stack on mobile) → sticky "Get started" bar on mobile.
- **Avoid:** presenting the AI as a human; spinners > 1s (use skeletons sized to final cards).
