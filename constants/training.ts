// types/training.ts
export type TrainingCategory = 'bodyweight' | 'machine' | 'freeWeights';

/** カテゴリの表示順（セグメントや一覧で共通） */
export const trainingCategories: TrainingCategory[] = [
  'bodyweight',
  'machine',
  'freeWeights',
];

/** users/{uid}/trainingList の1件（種目） */
export interface Training {
  /** ドキュメント ID。デフォルト種目は benchPress など、追加した種目は自動 ID */
  id: string;
  /** 表示名。古いデータには無いことがあるため、表示には trainingName() を使う */
  name?: string;
  category: TrainingCategory;
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
  /** 一覧の並び順（小さいほど上）。追加した種目は作成時刻が入り、デフォルト種目の後に並ぶ */
  order?: number;
  /** ユーザーが追加した種目か */
  custom?: boolean;
  /** ユーザーが編集した（デフォルト種目の再登録で上書きしない） */
  edited?: boolean;
  /**
   * 削除済み（論理削除）。過去の記録の種目名を表示するためにデータは残し、一覧には出さない。
   * デフォルト種目の再登録で復活しないようにする目的もある
   */
  deleted?: boolean;
}

/** 種目の入力項目（追加・編集画面で使う） */
export type TrainingInput = Pick<
  Training,
  'category' | 'defaultWeight' | 'defaultReps' | 'defaultSets'
> & { name: string };

/** 種目の表示名（名前が無い古いデータは ID を表示する） */
export const trainingName = (training: Pick<Training, 'id' | 'name'>) =>
  training.name || training.id;

/** users/{uid}/workoutLogs の1件（1日に行った1種目） */
export interface WorkoutLog {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  trainingId: string;
  /**
   * 記録した時点の種目名。後から種目名が変わったり削除されたりしても表示できるよう、
   * 記録にも持たせる（古い記録には無い）
   */
  trainingName?: string;
  category: TrainingCategory;
  weight: number;
  reps: number;
  sets: number;
  /** 作成日時（ミリ秒）。並び順に使う */
  createdAt: number;
}

/**
 * 記録の種目名。種目の今の名前（nameById）を優先し、無ければ記録時の名前、それも無ければ ID。
 * 種目名を変更すると過去の記録の表示も新しい名前になる。
 */
export const workoutLogName = (
  log: WorkoutLog,
  nameById?: Map<string, string>,
) => nameById?.get(log.trainingId) || log.trainingName || log.trainingId;

export const trainingCategoryMeta: Record<
  TrainingCategory,
  { label: string; color: string }
> = {
  freeWeights: { label: 'Free Weights', color: '#3A9DE0' },
  machine: { label: 'Machine', color: '#E0A23A' },
  bodyweight: { label: 'Bodyweight', color: '#7BB662' },
};
