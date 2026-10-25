// modals/WorkoutList.tsx
import { useState } from 'react';
import { Alert, StyleSheet, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CategorySegment from '@/components/CategorySegment';
import TrainingList from '@/components/TrainingList';
import WorkoutValuesForm from '@/components/WorkoutValuesForm';
import { Palette } from '@/constants/Colors';
import {
  Training,
  TrainingCategory,
  WorkoutValues,
  trainingCategoryMeta,
  trainingName,
} from '@/constants/training';
import { formatDayLabel, toDateString } from '@/helper/format';
import { addWorkoutLog } from '@/helper/workoutLog';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';

// Select Workout モーダル。2段階で記録を追加する。
//   1. カテゴリを切り替えて種目を選ぶ（+ を押す）
//   2. 重量・回数・セット数を入力して「記録する」
// Add Workout ボタンから、記録する日付を URL パラメータ（date）で受け取る。

export default function WorkoutList() {
  const [activeTab, setActiveTab] = useState<TrainingCategory>('freeWeights');
  // 値を入力中の種目（null なら種目の一覧を表示）
  const [selected, setSelected] = useState<Training | null>(null);
  const userId = useUserId();
  // 全種目を購読し、選択中のカテゴリだけを表示する（Other で追加した種目もすぐ反映される）
  const { trainings, loading } = useTrainings(userId);
  const params = useLocalSearchParams<{ date?: string }>();
  // パラメータがない場合（直接開かれた場合など）は今日に記録する
  const today = toDateString(new Date());
  const date = params.date ?? today;

  /** 「記録する」を押したとき: 入力した値で記録を追加して閉じる */
  const handleRecord = (training: Training) => (values: WorkoutValues) => {
    if (!userId) return;
    // 画面には書き込み完了を待たずに反映されるため、先に閉じる
    addWorkoutLog(userId, date, training, values).catch((e) => {
      console.error('Failed to add workout log:', e);
      Alert.alert('エラー', '記録の保存に失敗しました。');
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.grabberRow}>
        <View style={styles.grabber} />
      </View>
      <View style={styles.titleRow}>
        {selected ? (
          // 2段階目: 種目の一覧に戻る
          <Pressable
            onPress={() => setSelected(null)}
            hitSlop={8}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="種目の一覧に戻る"
          >
            <FontAwesome name="angle-left" size={22} color={Palette.primary} />
            <Text style={styles.title}>記録の入力</Text>
          </Pressable>
        ) : (
          <Text style={styles.title}>Select Workout</Text>
        )}
        <Pressable onPress={() => router.back()} hitSlop={8}>
          {({ pressed }) => (
            <Text style={[styles.close, pressed && styles.closePressed]}>
              閉じる
            </Text>
          )}
        </Pressable>
      </View>

      {selected ? (
        <WorkoutValuesForm
          key={selected.id}
          initialValues={{
            weight: selected.defaultWeight,
            reps: selected.defaultReps,
            sets: selected.defaultSets,
          }}
          submitLabel="記録する"
          errorMessage="記録の保存に失敗しました。"
          onSubmit={handleRecord(selected)}
          header={
            <View style={styles.selectedHeader}>
              <View
                style={[
                  styles.categoryBar,
                  {
                    backgroundColor:
                      trainingCategoryMeta[selected.category].color,
                  },
                ]}
              />
              <View style={styles.selectedTexts}>
                <Text style={styles.selectedName}>
                  {trainingName(selected)}
                </Text>
                <Text style={styles.selectedDate}>
                  {formatDayLabel(date, today)}
                </Text>
              </View>
            </View>
          }
        />
      ) : (
        <>
          <CategorySegment
            value={activeTab}
            onChange={setActiveTab}
            style={styles.segment}
          />
          <TrainingList
            trainings={trainings.filter((t) => t.category === activeTab)}
            loading={loading}
            onAdd={setSelected}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  grabberRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.dashed,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  close: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.primary,
  },
  closePressed: {
    color: Palette.primaryPressed,
  },
  segment: {
    marginHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedHeader: {
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
  selectedTexts: {
    gap: 3,
  },
  selectedName: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  selectedDate: {
    fontSize: 13,
    color: Palette.textMuted,
  },
});
