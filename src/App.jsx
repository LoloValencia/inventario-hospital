import React, { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Trash2,
  Plus,
  Minus,
  Zap,
  ZapOff,
  Settings,
  LogOut,
  Database,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { auth, db, storage } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

/* ======================================================
   CONFIG
====================================================== */
const APP_ID = import.meta.env.VITE_APP_ID || "inventario-hospital";

/* ======================================================
   UI helpers
====================================================== */
const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  const base =
    "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-50";
  const styles = {
    primary: "bg-[#e55e51] text-white",
    secondary: "bg-gray-100 text-gray-700",
    dark: "bg-gray-800 text-white",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

/* ======================================================
   APP
====================================================== */
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [config, setConfig] = useState({
    floors: [],
    services: [],
    signalTypes: [],
    typologies: [],
    materials: [],
    infoMaterials: [],
    authorizedUsers: [],
  });

  const initialForm = useMemo(
    () => ({
      codigo: "",
      piso: "",
      servicio: "",
      tipoSenal: "",
      tipologia: "",
      material: "",
      materialInfo: "",
      ancho: "",
      largo: "",
      espesor: "",
      tieneIluminacion: false,
      especificacionIluminacion: "",
      cantidad: 1,
      photoUrls: [],
      photoPaths: [],
    }),
    []
  );

  const [formData, setFormData] = useState(initialForm);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ======================================================
     ONLINE / OFFLINE
  ====================================================== */
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /* ======================================================
     AUTH
  ====================================================== */
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ======================================================
     FIRESTORE SUBSCRIPTIONS
  ====================================================== */
  useEffect(() => {
    if (!firebaseUser) return;

    const configRef = doc(
      db,
      "artifacts",
      APP_ID,
      "public",
      "data",
      "config",
      "global"
    );

    const unsubConfig = onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        setConfig(snap.data());
      } else {
        const def = {
          floors: ["Planta Baja", "Piso 1", "Piso 2"],
          services: ["Admisión", "Emergencias"],
          signalTypes: ["Informativa", "Restrictiva"],
          typologies: ["Bandera", "Adosado"],
          materials: ["Acrílico", "PVC"],
          infoMaterials: ["Vinilo", "Impresión"],
          authorizedUsers: [{ name: "Admin", isAdmin: true, pin: "1234" }],
        };
        setDoc(configRef, def);
        setConfig(def);
      }
    });

    const itemsRef = collection(
      db,
      "artifacts",
      APP_ID,
      "public",
      "data",
      "rotulos"
    );

    const unsubItems = onSnapshot(itemsRef, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(data);
    });

    return () => {
      unsubConfig();
      unsubItems();
    };
  }, [firebaseUser]);

  /* ======================================================
     LOGIN
  ====================================================== */
  const handleLogin = (e) => {
    e.preventDefault();
    const name = e.target.username.value.trim().toLowerCase();
    const pin = e.target.pin.value.trim();

    const found = config.authorizedUsers.find(
      (u) => u.name.toLowerCase() === name
    );

    if (!found) return notify("Usuario no registrado", "error");
    if (found.isAdmin && found.pin !== pin)
      return notify("PIN incorrecto", "error");

    setUser(found);
    setView("form");
    notify("Bienvenido " + found.name);
  };

  const handleLogout = () => {
    setUser(null);
    setView("login");
  };

  /* ======================================================
     IMAGE COMPRESS
  ====================================================== */
  const compressToJpegBlob = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = img.width > 1200 ? 1200 / img.width : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.7);
        };
      };
    });

  /* ======================================================
     HANDLE PHOTO (ONLINE)
  ====================================================== */
  const handlePhoto = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!isOnline) return notify("Sin internet", "error");
      if (formData.photoUrls.length >= 3)
        return notify("Máx. 3 fotos", "error");

      setIsCompressing(true);

      const code =
        formData.codigo || `ROT-${Date.now().toString().slice(-4)}`;
      if (!formData.codigo)
        setFormData((p) => ({ ...p, codigo: code }));

      const blob = await compressToJpegBlob(file);
      const idx = formData.photoUrls.length + 1;
      const name = `${code}_${String(idx).padStart(2, "0")}.jpg`;
      const path = `rotulos/${APP_ID}/${code}/${name}`;

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      setFormData((p) => ({
        ...p,
        photoUrls: [...p.photoUrls, url],
        photoPaths: [...p.photoPaths, path],
      }));

      notify("Foto cargada");
    } catch (e) {
      console.error(e);
      notify("Error foto", "error");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  /* ======================================================
     SAVE RECORD
  ====================================================== */
  const saveRecord = async () => {
    if (!isOnline) return notify("Sin internet", "error");

    try {
      await addDoc(
        collection(db, "artifacts", APP_ID, "public", "data", "rotulos"),
        {
          ...formData,
          fecha: new Date().toLocaleDateString(),
          responsable: user.name,
          timestamp: serverTimestamp(),
        }
      );
      setFormData(initialForm);
      setView("list");
      notify("Registro guardado");
    } catch (e) {
      console.error(e);
      notify("Error al guardar", "error");
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */
  if (loading) return <div className="p-10">Cargando...</div>;

  if (!user)
    return (
      <form
        onSubmit={handleLogin}
        className="p-10 max-w-xs mx-auto space-y-4"
      >
        <input
          name="username"
          placeholder="Usuario"
          className="w-full p-4 border rounded-xl"
          required
        />
        <input
          name="pin"
          placeholder="PIN"
          type="password"
          className="w-full p-4 border rounded-xl"
        />
        <Button type="submit">Entrar</Button>
      </form>
    );

  return (
    <div className="p-6 space-y-4">
      <header className="flex justify-between items-center">
        <strong>{user.name}</strong>
        <button onClick={handleLogout}>
          <LogOut />
        </button>
      </header>

      {notification && (
        <div className="text-sm">
          {notification.type === "error" ? (
            <XCircle />
          ) : (
            <CheckCircle />
          )}{" "}
          {notification.msg}
        </div>
      )}

      {view === "form" && (
        <>
          <input
            placeholder="Servicio"
            className="w-full p-3 border rounded"
            value={formData.servicio}
            onChange={(e) =>
              setFormData({ ...formData, servicio: e.target.value })
            }
          />

          <div className="flex gap-2">
            {formData.photoUrls.map((u) => (
              <img key={u} src={u} className="w-20 h-20 object-cover" />
            ))}
            {formData.photoUrls.length < 3 && (
              <label className="w-20 h-20 border flex items-center justify-center">
                {isCompressing ? "..." : <Camera />}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={handlePhoto}
                />
              </label>
            )}
          </div>

          <Button onClick={saveRecord}>Guardar Registro</Button>
          <Button variant="secondary" onClick={() => setView("list")}>
            Ver lista
          </Button>
        </>
      )}

      {view === "list" && (
        <>
          {items.map((it) => (
            <div key={it.id} className="border p-3 rounded">
              {it.servicio}
            </div>
          ))}
          <Button variant="secondary" onClick={() => setView("form")}>
            Nuevo
          </Button>
        </>
      )}
    </div>
  );
}