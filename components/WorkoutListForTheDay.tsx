import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Palette, Shadow } from '@/constants/Colors';
import { WorkoutRecord } from '@/constants/dummyWorkoutLog';
import { trainingCategoryMeta } from '@/constants/training';
import { formatTrainingDetail } from '@/helper/format';

type WorkoutListProps = {
  workouts: WorkoutRecord[];
};

export default function WorkoutList({ workouts }: WorkoutListProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {workouts.map((workout) => {
        const category = trainingCategoryMeta[workout.category];
        return (
          <View key={workout.name} style={styles.card}>
            <View
              style={[styles.categoryBar, { backgroundColor: category.color }]}
            />
            <View style={styles.texts}>
              <Text style={styles.name}>{workout.name}</Text>
              <Text style={styles.detail}>
                {formatTrainingDetail(
                  workout.weight,
                  workout.reps,
                  workout.sets,
                )}
              </Text>
            </View>
            <Text style={styles.tag}>{category.label}</Text>
          </View>
        );
      })}
      {workouts.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>この日の記録はありません</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    // 浮いている Add Workout ボタンに最後の行が隠れないための余白
    paddingBottom: 120,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Palette.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...Shadow.card,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  categoryBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  detail: {
    fontSize: 12,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
  tag: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.tagText,
    backgroundColor: Palette.surfaceMuted,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.dashed,
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
});
