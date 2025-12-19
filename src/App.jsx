import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Camera, Trash2, XCircle, Image as ImageIcon, Database, 
  Plus, Zap, ZapOff, Settings, LogOut, UserCheck, CheckCircle
} from 'lucide-react';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN || '';

const BRAND = {
  primary: "#686874",
  secondary: "#e55e51",
  accent: "#f9dcd1",
  font: "'Inter', sans-serif"
};

// ---------- COMPONENTES ----------
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[24px] shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white"
    style={{ background: BRAND.secondary }}
  >
    {children}
  </button>
);

// ---------- APP ----------
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        await signInAnonymously(auth);
      }
    };
    init();

    const unsub = onAuthStateChanged(auth, () => {
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-red-500 rounded-full"></div>
      </div>
    );
  }

  return (
  <div className="min-h-full w-full flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-sm">
      <Card className="p-8 text-center">
        <h1 className="text-xl font-black text-gray-700 mb-4">
          Inventario Hospitalario
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          App React funcionando correctamente
        </p>
        <Button>ENTRAR</Button>
      </Card>
    </div>
  </div>
);
}
