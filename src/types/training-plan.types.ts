export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest?: number;
  weight?: number;
}

export interface TrainingPlan {
  _id: string;
  name: string;
  description?: string;
  level?: string;
  duration?: number;
  exercises?: Exercise[];
  userId?: string;
  trainerId?: string;
  sharedWith?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingPlansResponse {
  items: TrainingPlan[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
