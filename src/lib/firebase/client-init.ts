'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// V IMPORTANT: Please replace the placeholder values below with your
// actual Firebase project's configuration.
const firebaseConfig = {
  apiKey: "AIzaSyAFxJoorvt92LzUiori6jjHpJGz2CdlAYc",
  authDomain: "kmrcl-f6b38.firebaseapp.com",
  projectId: "kmrcl-f6b38",
  storageBucket: "kmrcl-f6b38.firebasestorage.app",
  messagingSenderId: "279182075432",
  appId: "1:279182075432:web:8cae03430c5c8b83f6371d"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
