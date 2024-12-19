import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGINGSENDER_ID,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
