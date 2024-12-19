import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGINGSENDER_ID,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
