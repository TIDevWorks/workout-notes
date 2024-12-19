// components/TrainingList.tsx
import { View, Text, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useEffect, useState } from 'react';
import { Training, TrainingCategory } from '@/constants/training';

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
    <View style={styles.container}>
      {trainings.map((training) => (
        <View key={training.id} style={styles.trainingItem}>
          <Text style={styles.trainingName}>{training.id}</Text>
          <Text style={styles.trainingDetails}>
            {`${training.defaultWeight} kg × ${training.defaultReps} reps × ${training.defaultSets} sets`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  trainingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  trainingName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trainingDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
