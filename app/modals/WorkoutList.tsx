// modals/WorkoutList.tsx
import { useState } from 'react';
import { Alert, StyleSheet, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Palette } from '@/constants/Colors';
import { useUserId } from '@/hooks/useUserId';
import {
  Training,
  TrainingCategory,
  trainingCategoryMeta,
} from '@/constants/training';
import TrainingList from '@/components/TrainingList';
import { toDateString } from '@/helper/format';
import { addWorkoutLog } from '@/helper/workoutLog';

// Select Workout モーダル。カテゴリを切り替えて種目を選び、+ で記録を追加する。
// Add Workout ボタンから、記録する日付を URL パラメータ（date）で受け取る。

/** セグメントの並び順 */
const TABS: TrainingCategory[] = ['bodyweight', 'machine', 'freeWeights'];

/** カテゴリ切り替えのセグメントボタン */
type TabProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function TabButton({ label, isActive, onPress }: TabProps) {
  return (
    <Pressable
      style={[styles.segment, isActive && styles.activeSegment]}
      onPress={onPress}
    >
      <Text style={[styles.segmentText, isActive && styles.activeSegmentText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function WorkoutList() {
  const [activeTab, setActiveTab] = useState<TrainingCategory>('freeWeights');
  const userId = useUserId();
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
      <View style={styles.segmentContainer}>
        {TABS.map((tab) => (
          <TabButton
            key={tab}
            label={trainingCategoryMeta[tab].label}
            isActive={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </View>
      {userId && (
        <TrainingList category={activeTab} userId={userId} onAdd={handleAdd} />
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
  segmentContainer: {
    flexDirection: 'row',
    gap: 3,
    marginHorizontal: 20,
    padding: 3,
    borderRadius: 10,
    backgroundColor: Palette.surfaceMuted,
  },
  segment: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: Palette.surface,
    shadowColor: Palette.text,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  activeSegmentText: {
    fontWeight: '700',
    color: Palette.text,
  },
});
