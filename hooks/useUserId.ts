// hooks/useUserId.ts
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/firebaseConfig';

/** ログイン中のユーザーの uid。引き継ぎでユーザーが切り替わると更新される */
export function useUserId() {
  const [userId, setUserId] = useState(auth.currentUser?.uid);

  useEffect(() => onAuthStateChanged(auth, (user) => setUserId(user?.uid)), []);

  return userId;
}
