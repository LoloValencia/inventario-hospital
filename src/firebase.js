import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ?? DIAGNÓSTICO (TEMPORAL)
console.log("FIREBASE CONFIG >>>", firebaseConfig);
if (!firebaseConfig.apiKey) console.error("FALTA VITE_FIREBASE_API_KEY (undefined/vacío)");
if (!firebaseConfig.projectId) console.error("FALTA VITE_FIREBASE_PROJECT_ID (undefined/vacío)");

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;