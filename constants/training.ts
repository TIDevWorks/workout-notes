// types/training.ts
export type TrainingCategory = 'bodyweight' | 'machine' | 'freeWeights';

export interface Training {
  id: string;
  category: TrainingCategory;
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
}

/** users/{uid}/workoutLogs の1件（1日に行った1種目） */
export interface WorkoutLog {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  trainingId: string;
  category: TrainingCategory;
  weight: number;
  reps: number;
  sets: number;
  /** 作成日時（ミリ秒）。並び順に使う */
  createdAt: number;
}

export const trainingCategoryMeta: Record<
  TrainingCategory,
  { label: string; color: string }
> = {
  freeWeights: { label: 'Free Weights', color: '#3A9DE0' },
  machine: { label: 'Machine', color: '#E0A23A' },
  bodyweight: { label: 'Bodyweight', color: '#7BB662' },
};
