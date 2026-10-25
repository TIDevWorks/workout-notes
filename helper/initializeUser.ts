// helper/initializeUser.ts
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import {
  DEFAULT_TRAININGS_VERSION,
  generateDefaultWorkouts,
} from '@/helper/generateDefaultWorkouts';

/**
 * 匿名ログインし、デフォルトのトレーニングリストを登録する。
 * 初回に加えて、デフォルト種目のバージョンが上がったときも登録し直す。
 * 失敗した場合は例外を投げる（呼び出し側でリトライ）。
 */
export const initializeUser = async (): Promise<string> => {
  // 保存済みのログイン状態の復元を待つ
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

  const userRef = doc(db, 'users', user.uid);
  const userData = (await getDoc(userRef)).data();
  // defaultsVersion が無いユーザーは、initialized があればバージョン 1 で登録済み
  const registeredVersion =
    userData?.defaultsVersion ?? (userData?.initialized ? 1 : 0);

  if (registeredVersion < DEFAULT_TRAININGS_VERSION) {
    await generateDefaultWorkouts(user.uid);
    // 登録完了の印は最後に書くので、途中で失敗しても次回やり直される
    await setDoc(
      userRef,
      {
        initialized: true,
        defaultsVersion: DEFAULT_TRAININGS_VERSION,
        // 初回だけ作成日時を記録する
        ...(registeredVersion === 0 && { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
  }

  return user.uid;
};
