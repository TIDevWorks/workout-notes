// helper/initializeUser.ts
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebaseConfig';
import { generateDefaultWorkouts } from '@/helper/generateDefaultWorkouts';

/**
 * 匿名ログインし、初回のみデフォルトのトレーニングリストを登録する。
 * 失敗した場合は例外を投げる（呼び出し側でリトライ）。
 */
export const initializeUser = async (): Promise<string> => {
  // 保存済みのログイン状態の復元を待つ
  await auth.authStateReady();
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

  // 登録完了の印は最後に書くので、途中で失敗しても次回やり直される
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.data()?.initialized) {
    await generateDefaultWorkouts(user.uid);
    await setDoc(
      userRef,
      { initialized: true, createdAt: serverTimestamp() },
      { merge: true },
    );
  }

  return user.uid;
};
