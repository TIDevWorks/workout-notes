// helper/training.ts
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Training, TrainingInput } from '@/constants/training';

const trainingListRef = (userId: string) =>
  collection(db, 'users', userId, 'trainingList');

/** 種目を並び順（order → 名前）に並べる */
const compareTrainings = (a: Training, b: Training) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
  (a.name ?? a.id).localeCompare(b.name ?? b.id, 'ja');

/**
 * ユーザーの全種目を購読する（削除済みも含む。絞り込みは画面側で行う）。
 * 戻り値は購読解除の関数。
 */
export const subscribeTrainings = (
  userId: string,
  onChange: (trainings: Training[]) => void,
  onError: (error: Error) => void,
) =>
  onSnapshot(
    trainingListRef(userId),
    (snapshot) => {
      // ドキュメント ID（benchPress など）を種目の id として使う
      const trainings = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Training,
      );
      onChange(trainings.sort(compareTrainings));
    },
    onError,
  );

/** ユーザーが種目を追加する（ID は自動採番） */
export const addTraining = (userId: string, training: TrainingInput) =>
  addDoc(trainingListRef(userId), {
    ...training,
    // 作成時刻を並び順にして、デフォルト種目（0〜）の後に追加順で並べる
    order: Date.now(),
    custom: true,
    createdAt: serverTimestamp(),
  });

/** 種目を編集する。デフォルト種目でも、以降の再登録で上書きされないよう印を付ける */
export const updateTraining = (
  userId: string,
  trainingId: string,
  training: TrainingInput,
) =>
  updateDoc(doc(trainingListRef(userId), trainingId), {
    ...training,
    edited: true,
    updatedAt: serverTimestamp(),
  });

/**
 * 種目を削除する（論理削除）。過去の記録はそのまま残り、種目名も表示される。
 */
export const deleteTraining = (userId: string, trainingId: string) =>
  updateDoc(doc(trainingListRef(userId), trainingId), {
    deleted: true,
    deletedAt: serverTimestamp(),
  });
