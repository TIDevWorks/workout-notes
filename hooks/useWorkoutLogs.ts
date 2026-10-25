// hooks/useWorkoutLogs.ts
import { useEffect, useState } from 'react';
import { WorkoutLog } from '@/constants/training';
import { subscribeWorkoutLogs } from '@/helper/workoutLog';

type State = {
  key: string;
  logs: WorkoutLog[];
  error: boolean;
};

/** startDate〜endDate の記録をリアルタイムに取得する */
export function useWorkoutLogs(
  userId: string | undefined,
  startDate: string,
  endDate: string,
) {
  const key = `${userId}/${startDate}/${endDate}`;
  const [state, setState] = useState<State>({
    key: '',
    logs: [],
    error: false,
  });

  useEffect(() => {
    if (!userId) return;
    return subscribeWorkoutLogs(
      userId,
      startDate,
      endDate,
      (logs) => setState({ key, logs, error: false }),
      (error) => {
        console.error('Failed to load workout logs:', error);
        setState({ key, logs: [], error: true });
      },
    );
  }, [key, userId, startDate, endDate]);

  // 条件が変わってから最初の結果が届くまでは読み込み中として扱う
  const loading = state.key !== key;
  return {
    logs: loading ? [] : state.logs,
    loading,
    error: !loading && state.error,
  };
}
