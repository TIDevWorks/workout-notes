// types/training.ts
export type TrainingCategory = 'bodyweight' | 'machine' | 'freeWeights';

export interface Training {
  id: string;
  category: TrainingCategory;
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
}
