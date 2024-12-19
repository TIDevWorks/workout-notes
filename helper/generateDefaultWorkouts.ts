// helper/generateDefaultWorkouts.ts
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Training, TrainingCategory } from '@/constants/training';

interface TrainingData extends Omit<Training, 'id'> {
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
  category: TrainingCategory;
}

const defaultTrainings: Record<string, TrainingData> = {
  // フリーウェイト種目
  benchPress: {
    defaultWeight: 40,
    defaultReps: 10,
    defaultSets: 3,
    category: 'freeWeights',
  },
  squat: {
    defaultWeight: 50,
    defaultReps: 8,
    defaultSets: 3,
    category: 'freeWeights',
  },
  deadlift: {
    defaultWeight: 60,
    defaultReps: 6,
    defaultSets: 3,
    category: 'freeWeights',
  },
  shoulderPress: {
    defaultWeight: 30,
    defaultReps: 10,
    defaultSets: 3,
    category: 'freeWeights',
  },

  // マシン種目
  legPress: {
    defaultWeight: 80,
    defaultReps: 12,
    defaultSets: 3,
    category: 'machine',
  },
  latPulldown: {
    defaultWeight: 40,
    defaultReps: 12,
    defaultSets: 3,
    category: 'machine',
  },
  chestPress: {
    defaultWeight: 45,
    defaultReps: 12,
    defaultSets: 3,
    category: 'machine',
  },

  // 自重種目
  pushUp: {
    defaultWeight: 0,
    defaultReps: 15,
    defaultSets: 3,
    category: 'bodyweight',
  },
  pullUp: {
    defaultWeight: 0,
    defaultReps: 8,
    defaultSets: 3,
    category: 'bodyweight',
  },
  dipsBw: {
    defaultWeight: 0,
    defaultReps: 10,
    defaultSets: 3,
    category: 'bodyweight',
  },
};

export const generateDefaultWorkouts = async (uuid: string) => {
  try {
    const userRef = doc(db, 'users', uuid);
    const trainingListRef = collection(userRef, 'trainingList');

    // 各トレーニング種目をFirestoreに追加
    const promises = Object.entries(defaultTrainings).map(
      ([trainingId, data]) => {
        return setDoc(doc(trainingListRef, trainingId), data);
      },
    );

    await Promise.all(promises);
    console.log('Default workouts generated successfully');
  } catch (error) {
    console.error('Error generating default workouts:', error);
    throw error;
  }
};
