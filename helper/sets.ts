// helper/sets.ts
// セットごとの記録（SetEntry[]）の変換と表示。Firebase に依存しない純粋な処理
import { SetEntry, Training } from '@/constants/training';

/** 重量の表示（0 は「自重」） */
const formatWeight = (weight: number) => (weight ? `${weight} kg` : '自重');

/**
 * Firestore の記録データからセットごとの記録を取り出す。
 * 古い記録（weight / reps / sets の1つの値）は「同じ重量・回数のセットが sets 個」として扱う。
 */
export const toSetEntries = (data: {
  setEntries?: unknown;
  weight?: unknown;
  reps?: unknown;
  sets?: unknown;
}): SetEntry[] => {
  if (Array.isArray(data.setEntries)) {
    return data.setEntries.map((e) => ({
      weight: Number(e?.weight) || 0,
      reps: Number(e?.reps) || 0,
    }));
  }
  const sets = Number(data.sets) || 0;
  return Array.from({ length: sets }, () => ({
    weight: Number(data.weight) || 0,
    reps: Number(data.reps) || 0,
  }));
};

/** 種目のデフォルト値から、記録の初期値を作る（例: 40kg × 10回 × 3セット） */
export const defaultSetEntries = (
  training: Pick<Training, 'defaultWeight' | 'defaultReps' | 'defaultSets'>,
): SetEntry[] =>
  Array.from({ length: training.defaultSets }, () => ({
    weight: training.defaultWeight,
    reps: training.defaultReps,
  }));

/** すべてのセットが同じ重量・回数か */
export const isUniform = (entries: SetEntry[]) =>
  entries.every(
    (e) => e.weight === entries[0].weight && e.reps === entries[0].reps,
  );

/**
 * セットごとの記録の表示。
 * - すべて同じ: 60 kg × 10 reps × 3 sets
 * - 違う: 10 kg × 3 / 8 kg × 2
 */
export const formatSetsDetail = (entries: SetEntry[]) => {
  if (entries.length === 0) return '';
  if (isUniform(entries)) {
    const { weight, reps } = entries[0];
    return `${formatWeight(weight)} × ${reps} reps × ${entries.length} sets`;
  }
  return entries
    .map((e) => `${formatWeight(e.weight)} × ${e.reps}`)
    .join(' / ');
};
