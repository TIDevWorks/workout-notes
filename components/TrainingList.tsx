// components/TrainingList.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Training, trainingName } from '@/constants/training';
import { formatTrainingDetail } from '@/helper/format';

interface TrainingListProps {
  /** 表示する種目（並び順に整列済み） */
  trainings: Training[];
  /** 読み込み中は空表示を出さない */
  loading: boolean;
  /** 種目の + を押したとき */
  onAdd: (training: Training) => void;
}

/** Select Workout モーダルの種目一覧 */
export default function TrainingList({
  trainings,
  loading,
  onAdd,
}: TrainingListProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {!loading && trainings.length === 0 && (
        <Text style={styles.empty}>
          このカテゴリの種目はありません。Other
          の「種目の管理」から追加できます。
        </Text>
      )}
      {trainings.map((training) => (
        <View key={training.id} style={styles.trainingItem}>
          <View style={styles.texts}>
            <Text style={styles.trainingName}>{trainingName(training)}</Text>
            <Text style={styles.trainingDetails}>
              {formatTrainingDetail(
                training.defaultWeight,
                training.defaultReps,
                training.defaultSets,
              )}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addCircle,
              pressed && styles.addCirclePressed,
            ]}
            onPress={() => onAdd(training)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${trainingName(training)}を記録`}
          >
            <FontAwesome name="plus" size={14} color={Palette.primary} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  trainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  trainingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Palette.text,
  },
  trainingDetails: {
    fontSize: 12,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCirclePressed: {
    opacity: 0.6,
  },
  empty: {
    fontSize: 13,
    lineHeight: 20,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
