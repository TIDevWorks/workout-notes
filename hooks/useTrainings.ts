// hooks/useTrainings.ts
import { useEffect, useMemo, useState } from 'react';
import { Training, trainingName } from '@/constants/training';
import { subscribeTrainings } from '@/helper/training';

type State = {
  userId: string;
  trainings: Training[];
  error: boolean;
};

/**
 * ユーザーの種目をリアルタイムに取得する（並び順に整列済み）。
 * - trainings: 一覧に出す種目（削除済みを除く）
 * - allTrainings: 削除済みも含む全種目
 * - nameById: 種目 ID → 今の種目名（削除済みも含む。記録の種目名の表示に使う）
 */
export function useTrainings(userId: string | undefined) {
  const [state, setState] = useState<State>({
    userId: '',
    trainings: [],
    error: false,
  });

  useEffect(() => {
    if (!userId) return;
    return subscribeTrainings(
      userId,
      (trainings) => setState({ userId, trainings, error: false }),
      (error) => {
        console.error('Failed to load trainings:', error);
        setState({ userId, trainings: [], error: true });
      },
    );
  }, [userId]);

  // ユーザーが変わってから最初の結果が届くまでは読み込み中として扱う
  const loading = state.userId !== userId;
  const allTrainings = useMemo(
    () => (loading ? [] : state.trainings),
    [loading, state.trainings],
  );

  const trainings = useMemo(
    () => allTrainings.filter((t) => !t.deleted),
    [allTrainings],
  );
  const nameById = useMemo(
    () => new Map(allTrainings.map((t) => [t.id, trainingName(t)])),
    [allTrainings],
  );

  return {
    trainings,
    allTrainings,
    nameById,
    loading,
    error: !loading && state.error,
  };
}
