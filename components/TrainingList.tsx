// components/TrainingList.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, ScrollView, View, Text, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { Palette } from '@/constants/Colors';
import { Training, TrainingCategory } from '@/constants/training';
import { formatTrainingDetail } from '@/helper/format';

interface TrainingListProps {
  category: TrainingCategory;
  userId: string;
  /** 種目の + を押したとき */
  onAdd: (training: Training) => void;
}

/** 指定カテゴリの種目一覧（users/{uid}/trainingList）を表示する */
export default function TrainingList({
  category,
  userId,
  onAdd,
}: TrainingListProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);

  // カテゴリを切り替えるたびに、そのカテゴリの種目だけを取得し直す
  useEffect(() => {
    const fetchTrainings = async () => {
      const trainingListRef = collection(db, 'users', userId, 'trainingList');
      const q = query(trainingListRef, where('category', '==', category));
      const querySnapshot = await getDocs(q);

      const trainingData: Training[] = [];
      // ドキュメント ID（benchPress など）を種目の id として使う
      querySnapshot.forEach((doc) => {
        trainingData.push({ id: doc.id, ...doc.data() } as Training);
      });

      setTrainings(trainingData);
    };

    fetchTrainings();
  }, [category, userId]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {trainings.map((training) => (
        <View key={training.id} style={styles.trainingItem}>
          <View style={styles.texts}>
            <Text style={styles.trainingName}>{training.id}</Text>
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
});
