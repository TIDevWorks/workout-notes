// helper/workoutLog.ts
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Training, WorkoutLog, trainingName } from '@/constants/training';

const workoutLogsRef = (userId: string) =>
  collection(db, 'users', userId, 'workoutLogs');

/** 種目のデフォルト値で、指定日の記録を1件追加する */
export const addWorkoutLog = (
  userId: string,
  date: string,
  training: Training,
) =>
  addDoc(workoutLogsRef(userId), {
    date,
    trainingId: training.id,
    trainingName: trainingName(training),
    category: training.category,
    weight: training.defaultWeight,
    reps: training.defaultReps,
    sets: training.defaultSets,
    createdAt: serverTimestamp(),
  });

/**
 * startDate〜endDate（YYYY-MM-DD、両端を含む）の記録を購読する。
 * 戻り値は購読解除の関数。
 */
export const subscribeWorkoutLogs = (
  userId: string,
  startDate: string,
  endDate: string,
  onChange: (logs: WorkoutLog[]) => void,
  onError: (error: Error) => void,
) => {
  const q = query(
    workoutLogsRef(userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((doc) => {
        // 書き込み直後でサーバー時刻が未確定の場合は推定値を使う
        const data = doc.data({ serverTimestamps: 'estimate' });
        return {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp | null)?.toMillis() ?? 0,
        } as WorkoutLog;
      });
      logs.sort((a, b) => a.createdAt - b.createdAt);
      onChange(logs);
    },
    onError,
  );
};
