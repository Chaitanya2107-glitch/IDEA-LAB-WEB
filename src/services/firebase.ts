import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxnGhQ2vTn8CiEUcmFXKh4-Yst3xrY2Gg",
  authDomain: "revaiaictedealab.firebaseapp.com",
  projectId: "revaiaictedealab",
  storageBucket: "revaiaictedealab.firebasestorage.app",
  messagingSenderId: "759598669652",
  appId: "1:759598669652:web:2958e69db2a28beb73b2c1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
