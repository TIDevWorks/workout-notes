// helper/workoutLog.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import {
  Training,
  WorkoutLog,
  WorkoutValues,
  trainingName,
} from '@/constants/training';

const workoutLogsRef = (userId: string) =>
  collection(db, 'users', userId, 'workoutLogs');

/** Firestore のドキュメントを WorkoutLog に変換する */
const toWorkoutLog = (snapshot: DocumentSnapshot): WorkoutLog => {
  // 書き込み直後でサーバー時刻が未確定の場合は推定値を使う
  const data = snapshot.data({ serverTimestamps: 'estimate' }) ?? {};
  return {
    ...data,
    id: snapshot.id,
    createdAt: (data.createdAt as Timestamp | null)?.toMillis() ?? 0,
  } as WorkoutLog;
};

/** 指定日の記録を1件追加する */
export const addWorkoutLog = (
  userId: string,
  date: string,
  training: Training,
  values: WorkoutValues,
) =>
  addDoc(workoutLogsRef(userId), {
    date,
    trainingId: training.id,
    trainingName: trainingName(training),
    category: training.category,
    ...values,
    createdAt: serverTimestamp(),
  });

/** 記録の重量・回数・セット数を変更する */
export const updateWorkoutLog = (
  userId: string,
  logId: string,
  values: WorkoutValues,
) =>
  updateDoc(doc(workoutLogsRef(userId), logId), {
    ...values,
    updatedAt: serverTimestamp(),
  });

/** 記録を削除する（種目と違い、記録は完全に削除する） */
export const deleteWorkoutLog = (userId: string, logId: string) =>
  deleteDoc(doc(workoutLogsRef(userId), logId));

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
      const logs = snapshot.docs.map(toWorkoutLog);
      logs.sort((a, b) => a.createdAt - b.createdAt);
      onChange(logs);
    },
    onError,
  );
};

/** 記録1件を購読する（削除された・存在しない場合は null） */
export const subscribeWorkoutLog = (
  userId: string,
  logId: string,
  onChange: (log: WorkoutLog | null) => void,
  onError: (error: Error) => void,
) =>
  onSnapshot(
    doc(workoutLogsRef(userId), logId),
    (snapshot) => onChange(snapshot.exists() ? toWorkoutLog(snapshot) : null),
    onError,
  );
