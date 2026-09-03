/**
 * The AI coach, the food database, and the programme templates.
 *
 * Every one of these features can be switched off server-side by leaving an
 * API key unset, so each ships with a status shape the client checks before
 * offering a button. That is deliberate on both sides: the app has shipped
 * things that were enabled and inert before, and a button that 503s is worse
 * than no button.
 */

export interface CoachStatus {
  chat: boolean;
  planGeneration: boolean;
}

export interface FoodStatus {
  /** USDA lookups. Needs FDC_API_KEY. */
  search: boolean;
  /** Free-text logging. Needs both an Anthropic key and FDC_API_KEY. */
  parse: boolean;
}

/**
 * How the AI is doing, not merely whether it is configured.
 *
 * `lastOkAt` is the field worth reading: `enabled` only says a key is present,
 * and a key can be present and revoked, present and out of credit, or present
 * and mistyped. Until a request comes back, nobody knows.
 */
export interface AiStatus {
  enabled: boolean;
  model: string;
  lastCallAt: string | null;
  lastOkAt: string | null;
  lastError: string | null;
  calls: number;
  tokensUsed: number;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface CoachAnswer {
  answer: string;
  /** The figures the answer rests on, so a wrong one is detectable. */
  grounded_in: string[];
  /** True when the honest answer is "your log does not say". */
  insufficient_data: boolean;
}

export type CoachGoal = 'strength' | 'hypertrophy' | 'fat_loss' | 'general';

export interface GeneratePlanRequest {
  goal: CoachGoal;
  daysPerWeek: number;
  equipment?: string[];
  /** Muscle groups not to load. Never a diagnosis. */
  avoid?: string[];
  experience?: 'beginner' | 'intermediate' | 'advanced';
  weekdays?: number[];
  language?: string;
}

// ─── food ─────────────────────────────────────────────────────

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodSearchResult {
  fdcId: number;
  description: string;
  brand: string | null;
  dataType: string | null;
  per100g: Macros;
  servingSizeG: number | null;
  fromCache: boolean;
}

/**
 * One food read out of a sentence.
 *
 * When `matched` is false there are no macros at all — not zeros. Zero is a
 * number and a user scanning a list cannot tell it from a real one, so an
 * unmatched row renders as manual entry instead.
 */
export interface ParsedFood {
  name: string;
  quantity: number | null;
  unit: string | null;
  matched: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  source?: { fdcId: number; description: string; dataType: string | null };
  /** True when the grams were inferred rather than stated. Shown differently. */
  quantityEstimated: boolean;
}

export interface ParseResult {
  items: ParsedFood[];
  available: boolean;
}

// ─── templates ────────────────────────────────────────────────

export interface PeriodizationTemplateSummary {
  id: string;
  nameEn: string;
  nameHe: string;
  descriptionEn: string;
  descriptionHe: string;
  goal: 'strength' | 'hypertrophy' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  cycleWeeks: number;
}
