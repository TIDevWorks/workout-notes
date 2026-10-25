// modals/WorkoutList.tsx
import { useState } from 'react';
import { Alert, StyleSheet, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CategorySegment from '@/components/CategorySegment';
import TrainingList from '@/components/TrainingList';
import { Palette } from '@/constants/Colors';
import { Training, TrainingCategory } from '@/constants/training';
import { toDateString } from '@/helper/format';
import { addWorkoutLog } from '@/helper/workoutLog';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';

// Select Workout モーダル。カテゴリを切り替えて種目を選び、+ で記録を追加する。
// Add Workout ボタンから、記録する日付を URL パラメータ（date）で受け取る。

export default function WorkoutList() {
  const [activeTab, setActiveTab] = useState<TrainingCategory>('freeWeights');
  const userId = useUserId();
  // 全種目を購読し、選択中のカテゴリだけを表示する（Other で追加した種目もすぐ反映される）
  const { trainings, loading } = useTrainings(userId);
  const params = useLocalSearchParams<{ date?: string }>();
  // パラメータがない場合（直接開かれた場合など）は今日に記録する
  const date = params.date ?? toDateString(new Date());

  /** 種目の + を押したとき: 種目のデフォルト値で記録を追加して閉じる */
  const handleAdd = (training: Training) => {
    if (!userId) return;
    // 画面には書き込み完了を待たずに反映されるため、先に閉じる
    addWorkoutLog(userId, date, training).catch((e) => {
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
        <Text style={styles.title}>Select Workout</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          {({ pressed }) => (
            <Text style={[styles.close, pressed && styles.closePressed]}>
              閉じる
            </Text>
          )}
        </Pressable>
      </View>
      <CategorySegment
        value={activeTab}
        onChange={setActiveTab}
        style={styles.segment}
      />
      <TrainingList
        trainings={trainings.filter((t) => t.category === activeTab)}
        loading={loading}
        onAdd={handleAdd}
      />
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
});
