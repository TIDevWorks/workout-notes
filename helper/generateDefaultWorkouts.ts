import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface TrainingData {
  defaultWeight: number;
  defaultReps: number;
  defaultSets: number;
}

const defaultTrainings: Record<string, TrainingData> = {
  benchPress: {
    defaultWeight: 40,
    defaultReps: 10,
    defaultSets: 3,
  },
  squat: {
    defaultWeight: 50,
    defaultReps: 8,
    defaultSets: 3,
  },
  deadlift: {
    defaultWeight: 60,
    defaultReps: 6,
    defaultSets: 3,
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
    throw error; // エラーを上位で処理できるように投げる
  }
};
