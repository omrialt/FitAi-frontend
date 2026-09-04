/**
 * The AI coach, the food database, and the programme templates.
 *
 * Everything here is scoped to the signed-in user: no route takes a user id,
 * so there is no way to ask for someone else's plan or someone else's coach.
 *
 * Each feature is gated on a server-side key, so every one has a status call
 * the client makes before it offers a button. The project has shipped things
 * that were enabled and inert more than once; a button that 503s is worse than
 * no button.
 */

import api from './api';
import type {
  AiStatus,
  ChatTurn,
  CoachAnswer,
  CoachStatus,
  FoodSearchResult,
  FoodStatus,
  GeneratePlanRequest,
  ParseResult,
  PeriodizationTemplateSummary,
} from '../types/coach.types';
import type { TrainingPlan } from '../types/training-plan.types';

export const coachService = {
  getStatus: async (): Promise<CoachStatus> => {
    const response = await api.get('/ai-coach/status');
    return response.data.data;
  },

  /**
   * A question about your own training.
   *
   * The transcript is held here and re-sent each turn — nothing server-side
   * stores it. A chat log about someone's body and habits is a new category of
   * personal data, and this feature does not earn one.
   */
  ask: async (question: string, history: ChatTurn[] = []): Promise<CoachAnswer> => {
    const response = await api.post('/ai-coach/chat', { question, history });
    return response.data.data;
  },

  /**
   * Generates a plan and saves it in one call.
   *
   * `droppedSlugs` is normally empty. When it is not, the model named an
   * exercise the app does not have and it was left out, so the plan is thinner
   * than the one that was written — worth telling the user rather than hiding.
   */
  generatePlan: async (
    request: GeneratePlanRequest,
  ): Promise<{ plan: TrainingPlan; droppedSlugs: string[] }> => {
    const response = await api.post('/ai-coach/plan', request);
    return response.data.data;
  },
};

export const aiStatusService = {
  /**
   * Whether the AI is configured *and* whether it has ever worked.
   *
   * `lastOkAt` is the half that configuration cannot fake.
   */
  get: async (): Promise<AiStatus> => {
    const response = await api.get('/ai-review/status');
    return response.data.data;
  },
};

export const foodService = {
  getStatus: async (): Promise<FoodStatus> => {
    const response = await api.get('/foods/status');
    return response.data.data;
  },

  search: async (q: string, limit = 10): Promise<FoodSearchResult[]> => {
    const response = await api.get('/foods/search', { params: { q, limit } });
    return response.data.data;
  },

  /** Free text to a list of foods with macros from USDA, never from a model. */
  parse: async (text: string): Promise<ParseResult> => {
    const response = await api.post('/foods/parse', { text });
    return response.data.data;
  },
};

export const templateService = {
  list: async (): Promise<PeriodizationTemplateSummary[]> => {
    const response = await api.get('/training-plans/templates');
    return response.data.data;
  },

  /** Creates a real, editable plan. Nothing links it back to the template. */
  create: async (body: {
    templateId: string;
    weekdays?: number[];
    title?: string;
    language?: string;
  }): Promise<TrainingPlan> => {
    const response = await api.post('/training-plans/from-template', body);
    return response.data.data;
  },
};
