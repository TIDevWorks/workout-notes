// components/TrainingList.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { Palette } from '@/constants/Colors';
import { Training, TrainingCategory } from '@/constants/training';
import { formatTrainingDetail } from '@/helper/format';

interface TrainingListProps {
  category: TrainingCategory;
  userId: string;
}

export default function TrainingList({ category, userId }: TrainingListProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    const fetchTrainings = async () => {
      const trainingListRef = collection(db, 'users', userId, 'trainingList');
      const q = query(trainingListRef, where('category', '==', category));
      const querySnapshot = await getDocs(q);

      const trainingData: Training[] = [];
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
          <View style={styles.addCircle}>
            <FontAwesome name="plus" size={14} color={Palette.primary} />
          </View>
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
});
