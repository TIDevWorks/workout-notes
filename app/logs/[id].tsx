import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import SetsForm from '@/components/SetsForm';
import { Palette } from '@/constants/Colors';
import { trainingCategoryMeta, workoutLogName } from '@/constants/training';
import { formatDayLabel, toDateString } from '@/helper/format';
import { deleteWorkoutLog, updateWorkoutLog } from '@/helper/workoutLog';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';
import { useWorkoutLog } from '@/hooks/useWorkoutLog';

/**
 * 記録の編集画面（/logs/{記録 ID}）。セットごとの重量・回数の変更（セットの追加・削除を含む）と、
 * 記録の削除ができる。
 * Calendar 画面のリストで記録をタップすると開く。
 */
export default function EditWorkoutLog() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useUserId();
  const { log, loading } = useWorkoutLog(userId, id);
  const { nameById } = useTrainings(userId);
  const today = useMemo(() => toDateString(new Date()), []);
  // 削除した直後に「見つかりません」が一瞬表示されないようにする
  const [deleting, setDeleting] = useState(false);

  if (loading || deleting) return <View style={styles.container} />;
  if (!log || !userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>この記録は見つかりませんでした。</Text>
      </View>
    );
  }

  const name = workoutLogName(log, nameById);

  const confirmDelete = () =>
    Alert.alert(
      `「${name}」の記録を削除しますか？`,
      'この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteWorkoutLog(userId, log.id);
              router.back();
            } catch (e) {
              setDeleting(false);
              console.error('Failed to delete workout log:', e);
              Alert.alert('エラー', '記録の削除に失敗しました。');
            }
          },
        },
      ],
    );

  return (
    <View style={styles.container}>
      <SetsForm
        // 読み込み完了後に初期値を入れるため、記録ごとにフォームを作り直す
        key={log.id}
        initialSets={log.setEntries}
        submitLabel="保存する"
        errorMessage="記録の保存に失敗しました。"
        onSubmit={async (sets) => {
          await updateWorkoutLog(userId, log.id, sets);
          router.back();
        }}
        header={
          <View style={styles.header}>
            <View
              style={[
                styles.categoryBar,
                { backgroundColor: trainingCategoryMeta[log.category].color },
              ]}
            />
            <View style={styles.headerTexts}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.date}>{formatDayLabel(log.date, today)}</Text>
            </View>
          </View>
        }
        footer={
          <Pressable
            onPress={confirmDelete}
            style={styles.deleteButton}
            accessibilityRole="button"
          >
            {({ pressed }) => (
              <Text
                style={[styles.deleteText, pressed && styles.deletePressed]}
              >
                この記録を削除
              </Text>
            )}
          </Pressable>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 4,
  },
  categoryBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  headerTexts: {
    gap: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  date: {
    fontSize: 13,
    color: Palette.textMuted,
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
