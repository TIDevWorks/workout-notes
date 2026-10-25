import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import TrainingForm from '@/components/TrainingForm';
import { Palette } from '@/constants/Colors';
import { trainingName } from '@/constants/training';
import { deleteTraining, updateTraining } from '@/helper/training';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';

/**
 * 種目の編集画面（/trainings/{種目 ID}）。名前・カテゴリ・初期値の変更と削除ができる。
 * 過去の記録は変わらない（種目名だけは新しい名前で表示される）。
 */
export default function EditTraining() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useUserId();
  const { trainings, loading } = useTrainings(userId);
  const training = trainings.find((t) => t.id === id);
  // 削除すると一覧から先に消えるため、その間に「見つかりませんでした」が出ないようにする
  const [deleting, setDeleting] = useState(false);

  if (loading || deleting) return <View style={styles.container} />;
  // 削除済み、または存在しない ID
  if (!training || !userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>この種目は見つかりませんでした。</Text>
      </View>
    );
  }

  const confirmDelete = () =>
    Alert.alert(
      `「${trainingName(training)}」を削除しますか？`,
      'Select Workout に表示されなくなります。これまでの記録は残ります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteTraining(userId, training.id);
              router.back();
            } catch (e) {
              setDeleting(false);
              console.error('Failed to delete training:', e);
              Alert.alert('エラー', '種目の削除に失敗しました。');
            }
          },
        },
      ],
    );

  return (
    <TrainingForm
      // 読み込み完了後に初期値を入れるため、種目ごとにフォームを作り直す
      key={training.id}
      initialValues={{
        name: trainingName(training),
        category: training.category,
        defaultWeight: training.defaultWeight,
        defaultReps: training.defaultReps,
        defaultSets: training.defaultSets,
      }}
      submitLabel="保存する"
      // 自分自身の名前はそのまま保存できるように除く
      existingNames={trainings
        .filter((t) => t.id !== training.id)
        .map(trainingName)}
      errorMessage="種目の保存に失敗しました。"
      onSubmit={async (input) => {
        await updateTraining(userId, training.id, input);
        router.back();
      }}
      footer={
        <Pressable
          onPress={confirmDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <Text style={[styles.deleteText, pressed && styles.deletePressed]}>
              この種目を削除
            </Text>
          )}
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  message: {
    fontSize: 14,
    color: Palette.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  deleteButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '500',
    color: Palette.danger,
  },
  deletePressed: {
    opacity: 0.6,
  },
});
