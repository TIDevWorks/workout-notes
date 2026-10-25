// constants/dummyWorkoutLog.ts
// TODO: 記録のデータ層（Firestore）を実装したら削除する。表示確認用のダミーデータ。
import { TrainingCategory } from '@/constants/training';
import { toDateString } from '@/helper/format';

export interface WorkoutRecord {
  name: string;
  category: TrainingCategory;
  weight: number;
  reps: number;
  sets: number;
}

const pool: WorkoutRecord[] = [
  {
    name: 'ベンチプレス',
    category: 'freeWeights',
    weight: 60,
    reps: 10,
    sets: 3,
  },
  { name: 'スクワット', category: 'freeWeights', weight: 80, reps: 8, sets: 3 },
  {
    name: 'デッドリフト',
    category: 'freeWeights',
    weight: 100,
    reps: 5,
    sets: 3,
  },
  {
    name: 'チェストプレス',
    category: 'machine',
    weight: 40,
    reps: 12,
    sets: 3,
  },
  { name: '懸垂', category: 'bodyweight', weight: 0, reps: 8, sets: 3 },
];

// 今日から何日前に、どの種目（pool の index）を記録したか
const offsets: Record<number, number[]> = {
  0: [0, 1, 2, 3],
  2: [4, 1],
  4: [0, 2],
  6: [1, 4],
  9: [3, 0],
  11: [2, 1],
  13: [0, 4],
};

export const dummyWorkoutLog: Record<string, WorkoutRecord[]> =
  Object.fromEntries(
    Object.entries(offsets).map(([daysAgo, indexes]) => {
      const date = new Date();
      date.setDate(date.getDate() - Number(daysAgo));
      return [toDateString(date), indexes.map((i) => pool[i])];
    }),
  );
