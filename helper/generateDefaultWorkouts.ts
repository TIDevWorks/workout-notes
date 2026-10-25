// helper/generateDefaultWorkouts.ts
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Training } from '@/constants/training';

// users/{uid}/trainingList へ登録するデフォルトの種目。
// キーがドキュメント ID（= 種目の id）になる。記録が ID を参照しているため、既存の ID は変えないこと。

/**
 * デフォルト種目のバージョン。種目を追加・変更したら上げると、
 * 既存ユーザーにも起動時に反映される（initializeUser 参照）。
 * 1: 最初の10種目（表示名なし） / 2: 表示名を追加し、21種目に拡充
 */
export const DEFAULT_TRAININGS_VERSION = 2;

type DefaultTraining = Omit<Training, 'id' | 'order' | 'custom'> & {
  name: string;
};

const defaultTrainings: Record<string, DefaultTraining> = {
  // フリーウェイト種目
  benchPress: {
    name: 'ベンチプレス',
    category: 'freeWeights',
    defaultWeight: 40,
    defaultReps: 10,
    defaultSets: 3,
  },
  inclineBenchPress: {
    name: 'インクラインベンチプレス',
    category: 'freeWeights',
    defaultWeight: 30,
    defaultReps: 10,
    defaultSets: 3,
  },
  squat: {
    name: 'スクワット',
    category: 'freeWeights',
    defaultWeight: 50,
    defaultReps: 8,
    defaultSets: 3,
  },
  deadlift: {
    name: 'デッドリフト',
    category: 'freeWeights',
    defaultWeight: 60,
    defaultReps: 6,
    defaultSets: 3,
  },
  shoulderPress: {
    name: 'ショルダープレス',
    category: 'freeWeights',
    defaultWeight: 30,
    defaultReps: 10,
    defaultSets: 3,
  },
  bentOverRow: {
    name: 'ベントオーバーロウ',
    category: 'freeWeights',
    defaultWeight: 40,
    defaultReps: 10,
    defaultSets: 3,
  },
  dumbbellCurl: {
    name: 'ダンベルカール',
    category: 'freeWeights',
    defaultWeight: 10,
    defaultReps: 12,
    defaultSets: 3,
  },
  lateralRaise: {
    name: 'サイドレイズ',
    category: 'freeWeights',
    defaultWeight: 6,
    defaultReps: 15,
    defaultSets: 3,
  },

  // マシン種目
  chestPress: {
    name: 'チェストプレス',
    category: 'machine',
    defaultWeight: 45,
    defaultReps: 12,
    defaultSets: 3,
  },
  pecFly: {
    name: 'ペックフライ',
    category: 'machine',
    defaultWeight: 30,
    defaultReps: 12,
    defaultSets: 3,
  },
  latPulldown: {
    name: 'ラットプルダウン',
    category: 'machine',
    defaultWeight: 40,
    defaultReps: 12,
    defaultSets: 3,
  },
  seatedRow: {
    name: 'シーテッドロウ',
    category: 'machine',
    defaultWeight: 40,
    defaultReps: 12,
    defaultSets: 3,
  },
  legPress: {
    name: 'レッグプレス',
    category: 'machine',
    defaultWeight: 80,
    defaultReps: 12,
    defaultSets: 3,
  },
  legExtension: {
    name: 'レッグエクステンション',
    category: 'machine',
    defaultWeight: 30,
    defaultReps: 12,
    defaultSets: 3,
  },
  legCurl: {
    name: 'レッグカール',
    category: 'machine',
    defaultWeight: 25,
    defaultReps: 12,
    defaultSets: 3,
  },

  // 自重種目
  pushUp: {
    name: '腕立て伏せ',
    category: 'bodyweight',
    defaultWeight: 0,
    defaultReps: 15,
    defaultSets: 3,
  },
  pullUp: {
    name: '懸垂',
    category: 'bodyweight',
    defaultWeight: 0,
    defaultReps: 8,
    defaultSets: 3,
  },
  dipsBw: {
    name: 'ディップス',
    category: 'bodyweight',
    defaultWeight: 0,
    defaultReps: 10,
    defaultSets: 3,
  },
  bodyweightSquat: {
    name: '自重スクワット',
    category: 'bodyweight',
    defaultWeight: 0,
    defaultReps: 20,
    defaultSets: 3,
  },
  crunch: {
    name: 'クランチ',
    category: 'bodyweight',
    defaultWeight: 0,
    defaultReps: 20,
    defaultSets: 3,
  },
  legRaise: {
    name: 'レッグレイズ',
    category: 'bodyweight',
    defaultWeight: 0,
    defaultReps: 15,
    defaultSets: 3,
  },
};

/**
 * デフォルトの種目を登録する。同じ ID に merge で書き込むため、何度実行しても重複せず、
 * ユーザーが追加した種目にも影響しない（初期化に失敗して再実行された場合も安全）。
 * ユーザーが編集・削除したデフォルト種目は、変更を残すため書き込まない。
 */
export const generateDefaultWorkouts = async (userId: string) => {
  try {
    const trainingListRef = collection(db, 'users', userId, 'trainingList');

    // 編集・削除済みの種目 ID（初回は空）
    const existing = await getDocs(trainingListRef);
    const keepIds = new Set(
      existing.docs
        .filter((d) => d.data().edited || d.data().deleted)
        .map((d) => d.id),
    );

    // 1回の書き込みでまとめて登録する（途中で失敗して一部だけ登録されることがない）
    const batch = writeBatch(db);
    Object.entries(defaultTrainings).forEach(([trainingId, data], index) => {
      if (keepIds.has(trainingId)) return;
      batch.set(
        doc(trainingListRef, trainingId),
        // 定義順に並ぶよう order を付ける
        { ...data, order: index, custom: false },
        { merge: true },
      );
    });

    await batch.commit();
    console.log('Default workouts generated successfully');
  } catch (error) {
    console.error('Error generating default workouts:', error);
    throw error;
  }
};
