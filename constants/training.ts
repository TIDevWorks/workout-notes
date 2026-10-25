// types/training.ts
export type TrainingCategory = 'bodyweight' | 'machine' | 'freeWeights';

export interface Training {
  id: string;
  category: TrainingCategory;
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
}

export const trainingCategoryMeta: Record<
  TrainingCategory,
  { label: string; color: string }
> = {
  freeWeights: { label: 'Free Weights', color: '#3A9DE0' },
  machine: { label: 'Machine', color: '#E0A23A' },
  bodyweight: { label: 'Bodyweight', color: '#7BB662' },
};
