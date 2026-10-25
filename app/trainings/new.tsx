import { router } from 'expo-router';
import TrainingForm from '@/components/TrainingForm';
import { trainingName } from '@/constants/training';
import { addTraining } from '@/helper/training';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';

/**
 * 種目の追加画面。ここで決めた値は、Select Workout で記録するときの初期値になる。
 */
export default function NewTraining() {
  const userId = useUserId();
  // 同じ名前の種目がないかの確認に使う
  const { trainings } = useTrainings(userId);

  return (
    <TrainingForm
      submitLabel="追加する"
      existingNames={trainings.map(trainingName)}
      errorMessage="種目の追加に失敗しました。"
      onSubmit={async (input) => {
        if (!userId) return;
        await addTraining(userId, input);
        router.back();
      }}
    />
  );
}
