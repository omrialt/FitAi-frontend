import { currentStatusService } from './current-status.service';
import { trainingPlanService } from './training-plan.service';
import { isPopulated, refId, unwrapResponse } from '../utils/refs';
import type { CurrentStatus } from '../types/current-status.types';
import type { TrainingPlan } from '../types/training-plan.types';

/** The active training plan, from the populated status when possible. */
export async function loadActivePlan(userId: string): Promise<TrainingPlan | null> {
  const status = unwrapResponse<CurrentStatus>(await currentStatusService.getByUserId(userId));
  const ref = status?.activeTrainingPlanId;
  const id = refId(ref);
  if (!id) return null;
  if (isPopulated<TrainingPlan>(ref)) return ref;
  try {
    return unwrapResponse<TrainingPlan>(await trainingPlanService.getById(id));
  } catch {
    return null; // deleted since it was made active
  }
}
