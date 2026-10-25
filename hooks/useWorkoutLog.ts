// hooks/useWorkoutLog.ts
import { useEffect, useState } from 'react';
import { WorkoutLog } from '@/constants/training';
import { subscribeWorkoutLog } from '@/helper/workoutLog';

type State = {
  key: string;
  log: WorkoutLog | null;
};

/** 記録1件をリアルタイムに取得する（存在しない・削除された場合は null） */
export function useWorkoutLog(userId: string | undefined, logId: string) {
  const key = `${userId}/${logId}`;
  const [state, setState] = useState<State>({ key: '', log: null });

  useEffect(() => {
    if (!userId) return;
    return subscribeWorkoutLog(
      userId,
      logId,
      (log) => setState({ key, log }),
      (error) => {
        console.error('Failed to load workout log:', error);
        setState({ key, log: null });
      },
    );
  }, [key, userId, logId]);

  // 条件が変わってから最初の結果が届くまでは読み込み中として扱う
  const loading = state.key !== key;
  return { log: loading ? null : state.log, loading };
}
