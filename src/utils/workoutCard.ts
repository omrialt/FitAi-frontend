import type { WorkoutSessionSummary } from '../types/workout-session.types';

/**
 * The shareable workout card: a branded image of one session.
 *
 * Split in two so the decisions can be tested without a canvas: buildCardModel
 * settles what goes on the card (which records, which name, what is cut), and
 * drawCard only paints it. Hebrew is drawn right-to-left; numbers keep their
 * own direction.
 */

export type CardFormat = 'feed' | 'story';

export const CARD_SIZE: Record<CardFormat, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export interface CardLabels {
  duration: string;
  volume: string;
  sets: string;
  minutes: string;
  kg: string;
  topSet: string;
  records: string;
  record: string;
  freeSession: string;
}

export interface CardModel {
  format: CardFormat;
  width: number;
  height: number;
  date: string;
  title: string;
  subtitle: string | null;
  name: string | null;
  stats: { label: string; value: string; unit: string }[];
  topSet: string | null;
  records: string[];
  labels: CardLabels;
}

const MAX_RECORDS = 3;
const MAX_TITLE = 28;
const MAX_LINE = 34;

/** Cut to `max` characters with an ellipsis; canvas does not wrap. */
export function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function kg(value: number, locale: string): string {
  // Whole kilos: a decimal on a share card is noise, and it overflows the tile.
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

/**
 * "110×5" kept left-to-right inside Hebrew. Without the isolate the bidi
 * algorithm splits it at the "×" and the card reads "5×110" — the same bug
 * the workout log had (N-34).
 */
export function weightByReps(weight: number, reps: number): string {
  return `\u2066${weight}×${reps}\u2069`;
}

export function buildCardModel(
  summary: WorkoutSessionSummary,
  options: {
    format: CardFormat;
    showName: boolean;
    name?: string;
    locale: string;
    labels: CardLabels;
  },
): CardModel {
  const { format, showName, name, locale, labels } = options;
  const title = summary.dayName || summary.planTitle || labels.freeSession;

  return {
    format,
    ...CARD_SIZE[format],
    date: new Date(summary.performedAt).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    title: clip(title, MAX_TITLE),
    subtitle: summary.dayName && summary.planTitle ? clip(summary.planTitle, MAX_LINE) : null,
    // Off unless asked for: nothing about a person is shared without a choice.
    name: showName && name ? clip(name, MAX_LINE) : null,
    stats: [
      ...(summary.durationMinutes
        ? [{ label: labels.duration, value: String(summary.durationMinutes), unit: labels.minutes }]
        : []),
      { label: labels.volume, value: kg(summary.volumeKg, locale), unit: labels.kg },
      { label: labels.sets, value: String(summary.totalSets), unit: '' },
    ],
    topSet: summary.topSet
      ? `${clip(summary.topSet.exercise, MAX_LINE - 10)} · ${weightByReps(summary.topSet.weight, summary.topSet.reps)}`
      : null,
    records: summary.records
      .slice(0, MAX_RECORDS)
      .map((r) => `${clip(r.exercise, MAX_LINE - 10)} · ${weightByReps(r.weight, r.reps)}`),
    labels,
  };
}

const COLORS = {
  bg: '#0f1115',
  panel: '#171a21',
  primary: '#4648d4',
  primarySoft: '#8b8dff',
  text: '#e7e8ee',
  muted: '#9a9eb0',
  gold: '#f0a43a',
};

const DISPLAY = '"Barlow Condensed", "Heebo", sans-serif';
const BODY = '"Heebo", "Rubik", sans-serif';

/** Wait for the faces the card uses; a fallback font would ship in the image. */
export async function loadCardFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`700 120px ${DISPLAY}`),
      document.fonts.load(`700 48px ${BODY}`),
      document.fonts.load(`400 40px ${BODY}`),
    ]);
  } catch {
    // Draw with whatever is available.
  }
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  model: CardModel,
  logo: HTMLImageElement | null,
): void {
  const { width, height } = model;
  const pad = 88;
  const right = width - pad;
  const story = model.format === 'story';

  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';

  // Ground and a diagonal band of the brand colour.
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);
  const band = ctx.createLinearGradient(0, 0, width, height * 0.5);
  band.addColorStop(0, COLORS.primary);
  band.addColorStop(1, 'rgba(70, 72, 212, 0)');
  ctx.fillStyle = band;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, height * 0.32);
  ctx.lineTo(0, height * 0.46);
  ctx.closePath();
  ctx.fill();

  const footerY = height - (story ? 180 : 110);
  // Nothing is drawn below this line, so the footer is never covered.
  const contentBottom = footerY - 110;
  let y = story ? 340 : 150;

  // Date, then the day's name large.
  ctx.fillStyle = COLORS.text;
  ctx.font = `400 40px ${BODY}`;
  ctx.fillText(model.date, right, y);
  y += story ? 150 : 130;
  ctx.font = `700 ${story ? 132 : 116}px ${DISPLAY}`;
  ctx.fillText(model.title, right, y);
  if (model.subtitle) {
    y += 64;
    ctx.font = `400 40px ${BODY}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(model.subtitle, right, y);
  }
  if (model.name) {
    y += 56;
    ctx.font = `500 36px ${BODY}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(model.name, right, y);
  }

  // Stat tiles across the width, right to left.
  y += story ? 150 : 90;
  const gap = 24;
  const tileW = (width - pad * 2 - gap * (model.stats.length - 1)) / model.stats.length;
  const tileH = 230;
  model.stats.forEach((stat, i) => {
    const x = right - i * (tileW + gap);
    ctx.fillStyle = COLORS.panel;
    roundRect(ctx, x - tileW, y, tileW, tileH, 28);
    ctx.fill();
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 34px ${BODY}`;
    ctx.fillText(stat.label, x - 32, y + 62);
    // The value shrinks until value and unit fit the tile.
    ctx.font = `500 34px ${BODY}`;
    const unitWidth = stat.unit ? ctx.measureText(stat.unit).width + 14 : 0;
    let size = 96;
    ctx.font = `700 ${size}px ${DISPLAY}`;
    while (size > 48 && ctx.measureText(stat.value).width + unitWidth > tileW - 64) {
      size -= 4;
      ctx.font = `700 ${size}px ${DISPLAY}`;
    }
    ctx.fillStyle = COLORS.text;
    ctx.direction = 'ltr';
    ctx.textAlign = 'right';
    ctx.fillText(stat.value, x - 32, y + 170);
    const valueWidth = ctx.measureText(stat.value).width;
    ctx.direction = 'rtl';
    if (stat.unit) {
      ctx.font = `500 34px ${BODY}`;
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(stat.unit, x - 32 - valueWidth - 14, y + 170);
    }
  });
  y += tileH + (story ? 170 : 80);

  // The heaviest set.
  if (model.topSet) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 36px ${BODY}`;
    ctx.fillText(model.labels.topSet, right, y);
    y += 62;
    ctx.fillStyle = COLORS.text;
    ctx.font = `700 52px ${BODY}`;
    ctx.fillText(model.topSet, right, y);
    y += story ? 150 : 76;
  }

  // Records broken, each with a badge.
  const rowH = story ? 96 : 76;
  if (model.records.length > 0 && y + 30 + rowH <= contentBottom) {
    ctx.fillStyle = COLORS.gold;
    ctx.font = `700 36px ${BODY}`;
    ctx.fillText(model.labels.records, right, y);
    y += 30;
    for (const record of model.records) {
      if (y + rowH > contentBottom) break;
      y += rowH;
      ctx.font = `700 30px ${BODY}`;
      const badge = model.labels.record;
      const badgeW = ctx.measureText(badge).width + 36;
      ctx.fillStyle = COLORS.gold;
      roundRect(ctx, right - badgeW, y - 42, badgeW, 54, 27);
      ctx.fill();
      ctx.fillStyle = COLORS.bg;
      ctx.fillText(badge, right - 18, y - 6);
      ctx.fillStyle = COLORS.text;
      ctx.font = `500 46px ${BODY}`;
      ctx.fillText(record, right - badgeW - 24, y);
    }
  }

  // Footer: logo and wordmark.
  ctx.fillStyle = COLORS.primarySoft;
  ctx.font = `700 56px ${DISPLAY}`;
  ctx.textAlign = 'left';
  ctx.direction = 'ltr';
  const logoSize = 84;
  if (logo) {
    // The logo's lettering is dark; it sits on a light tile on the dark card.
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, pad, footerY - logoSize + 18, logoSize, logoSize, 20);
    ctx.fill();
    ctx.drawImage(logo, pad + 6, footerY - logoSize + 24, logoSize - 12, logoSize - 12);
    ctx.fillStyle = COLORS.primarySoft;
  }
  ctx.fillText('FitAi', pad + (logo ? logoSize + 20 : 0), footerY);

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Render the card to a PNG data URL. */
export async function renderCard(model: CardModel): Promise<string> {
  await loadCardFonts();
  const logo = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/assets/icon-512.png';
  });
  const canvas = document.createElement('canvas');
  canvas.width = model.width;
  canvas.height = model.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  drawCard(ctx, model, logo);
  return canvas.toDataURL('image/png');
}
