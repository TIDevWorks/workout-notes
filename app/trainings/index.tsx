import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette, Shadow } from '@/constants/Colors';
import {
  trainingCategories,
  trainingCategoryMeta,
  trainingName,
} from '@/constants/training';
import { formatTrainingDetail } from '@/helper/format';
import { useTrainings } from '@/hooks/useTrainings';
import { useUserId } from '@/hooks/useUserId';

/**
 * 種目の管理画面。カテゴリごとに全種目を一覧表示し、タップで編集画面を開く。
 */
export default function TrainingManagement() {
  const userId = useUserId();
  const { trainings, loading } = useTrainings(userId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PrimaryButton
        label="Add Exercise"
        icon="plus"
        onPress={() => router.push('/trainings/new')}
      />

      {!loading &&
        trainingCategories.map((category) => {
          const meta = trainingCategoryMeta[category];
          const items = trainings.filter((t) => t.category === category);
          return (
            <View key={category} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[styles.categoryBar, { backgroundColor: meta.color }]}
                />
                <Text style={styles.sectionTitle}>{meta.label}</Text>
                <Text style={styles.count}>{`${items.length} 種目`}</Text>
              </View>
              <View style={styles.card}>
                {items.length === 0 && (
                  <Text style={styles.empty}>種目はありません</Text>
                )}
                {items.map((training, i) => (
                  <Link
                    key={training.id}
                    href={{
                      pathname: '/trainings/[id]',
                      params: { id: training.id },
                    }}
                    asChild
                  >
                    <Pressable>
                      {({ pressed }) => (
                        <View
                          style={[
                            styles.row,
                            i < items.length - 1 && styles.rowDivider,
                            pressed && styles.rowPressed,
                          ]}
                        >
                          <View style={styles.texts}>
                            <Text style={styles.name}>
                              {trainingName(training)}
                            </Text>
                            <Text style={styles.detail}>
                              {formatTrainingDetail(
                                training.defaultWeight,
                                training.defaultReps,
                                training.defaultSets,
                              )}
                            </Text>
                          </View>
                          <FontAwesome
                            name="angle-right"
                            size={18}
                            color={Palette.iconInactive}
                          />
                        </View>
                      )}
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 22,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryBar: {
    width: 4,
    height: 14,
    borderRadius: 2,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Palette.text,
  },
  count: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Palette.surface,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  rowPressed: {
    backgroundColor: Palette.surfaceMuted,
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
  empty: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
