import React, { useEffect, useMemo, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Camera,
  Trash2,
  Image as ImageIcon,
  Database,
  Plus,
  Minus,
  Zap,
  ZapOff,
  Settings,
  LogOut,
  UserCheck,
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * ? Vercel/Production:
 * - VITE_FIREBASE_CONFIG: JSON en una sola línea
 * - VITE_APP_ID: string (ej: inventario-hospital)
 * - VITE_INITIAL_AUTH_TOKEN: opcional (vacío)
 */
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || "{}");
const APP_ID = import.meta.env.VITE_APP_ID || "default-app-id";
const INITIAL_AUTH_TOKEN = import.meta.env.VITE_INITIAL_AUTH_TOKEN || "";

// --- Inicializa Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Marca ---
const BRAND = {
  primary: "#686874",
  secondary: "#e55e51",
  accent: "#f9dcd1",
  font: "'Inter', sans-serif",
};

// --- LOGO ---
const HospitalLogo = ({ className = "" }) => (
  <svg
    viewBox="0 0 161.1 48.7"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    style={{ enableBackground: "new 0 0 161.1 48.7" }}
  >
    <style type="text/css">
      {`.st0{fill:#686875;} .st1{fill:#E55E51;}`}
    </style>
    <g id="Dolores">
      <g>
        <path
          className="st0"
          d="M24.4,0C10.7,0,0,10.6,0,24s10.7,24.7,24.4,24.7S48.7,37.9,48.7,24S38,0,24.4,0z M24.4,44.5
          c-11.5,0-20.2-8.8-20.2-20.5S12.9,4.2,24.4,4.2S44.5,12.7,44.5,24S35.9,44.5,24.4,44.5z"
        />
        <path
          className="st1"
          d="M24.4,8.5c-8.5,0-15.1,6.9-15.1,15.6s6.6,16.2,15.1,16.2s15.1-7.1,15.1-16.2S32.8,8.5,24.4,8.5z M24.4,36.1
          c-6.1,0-10.9-5.3-10.9-12s4.8-11.4,10.9-11.4s10.9,5,10.9,11.4C35.3,30.8,30.5,36.1,24.4,36.1z"
        />
        <path
          className="st0"
          d="M54.9,7H51V3.2h18c7.6,0,13.2,5,13.2,12.9s-5.6,13-13.2,13h-9.8v16.8h-4.2C54.9,45.9,54.9,7,54.9,7z
          M68.5,25.4c5.6,0,9.3-3.5,9.3-9.3S74.1,7,68.5,7h-9.3v18.4H68.5z"
        />
        <path
          className="st0"
          d="M90.1,7h-3.9V3.2h24.4c2.6,0,3.7,1.1,3.7,3.7v4.3h-4V8.3c0-0.9-0.5-1.3-1.3-1.3H94.3v15.5h16v3.8h-16v14.5
          c0,0.9,0.5,1.3,1.3,1.3h15c0.8,0,1.3-0.4,1.3-1.3v-2.8h3.9v4.2c0,2.6-1.1,3.7-3.7,3.7H93.8c-2.6,0-3.7-1.1-3.7-3.7L90.1,7L90.1,7z"
        />
        <path
          className="st0"
          d="M120,42.1h2.6c0.8,0,1.3-0.4,1.3-1.3V3.2h3.9l21.8,30.4c1.5,2.1,3.5,5.6,3.5,5.6h0.1c0,0-0.3-3.3-0.3-5.6V6.9
          c0-2.6,1.1-3.7,3.7-3.7h4.5V7h-2.6c-0.9,0-1.3,0.4-1.3,1.3v37.6h-3.9l-21.8-30.4c-1.5-2.1-3.5-5.5-3.5-5.5h-0.1
          c0,0,0.4,3.3,0.4,5.5v26.7c0,2.6-1.1,3.7-3.7,3.7H120L120,42.1L120,42.1z"
        />
      </g>
    </g>
  </svg>
);

// --- UI ---
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  onClick,
  children,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) => {
  const base =
    "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50";
  const styles = {
    primary: "text-white shadow-lg",
    secondary: "bg-gray-100 text-gray-700",
    danger: "bg-red-50 text-red-600",
    dark: "bg-gray-800 text-white",
  };
  const gradient =
    variant === "primary"
      ? { background: `linear-gradient(135deg, ${BRAND.secondary} 0%, #C44D42 100%)` }
      : {};
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
      style={gradient}
    >
      {children}
    </button>
  );
};

const PillButton = ({ active, onClick, children, activeClass, inactiveClass }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 rounded-2xl text-[11px] font-black border transition-all ${
      active ? activeClass : inactiveClass
    }`}
  >
    {children}
  </button>
);

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null); // sesión interna (Admin/Instalador)
  const [view, setView] = useState("login");
  const [items, setItems] = useState([]);
  const [config, setConfig] = useState({
    floors: [],
    services: [],
    signalTypes: [],
    typologies: [],
    materials: [],
    infoMaterials: [],
    authorizedUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [notification, setNotification] = useState(null);

  const initialForm = useMemo(
    () => ({
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
      fotos: [],
    }),
    []
  );

  const [formData, setFormData] = useState(initialForm);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 1) Auth Firebase
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (INITIAL_AUTH_TOKEN) {
          await signInWithCustomToken(auth, INITIAL_AUTH_TOKEN);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error(e);
        notify("Error de autenticación Firebase", "error");
      }
    };
    initAuth();

    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u || null);
      if (u) {
        const saved = localStorage.getItem("hospital_session");
        if (saved) {
          setUser(JSON.parse(saved));
          setView("form");
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 2) Firestore subscriptions
  useEffect(() => {
    if (!firebaseUser) return;

    const configRef = doc(db, "artifacts", APP_ID, "public", "data", "config", "global");

    const unsubConfig = onSnapshot(
      configRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            floors: data.floors || [],
            services: data.services || [],
            signalTypes: data.signalTypes || [],
            typologies: data.typologies || [],
            materials: data.materials || [],
            infoMaterials: data.infoMaterials || [],
            authorizedUsers: data.authorizedUsers || [],
          });
        } else {
          const def = {
            floors: ["Sótano", "Planta Baja", "Piso 1", "Piso 2", "Piso 3"],
            services: ["Admisión", "Emergencias", "Rayos X", "Laboratorio", "UCI"],
            signalTypes: ["Informativa", "Preventiva", "Restrictiva", "Emergencia", "Obligación"],
            typologies: ["Colgante", "Bandera", "Adosado", "Tótem", "Directorio"],
            materials: ["Acrílico", "Alucobond", "PVC (Sintra)", "Vidrio", "Acero Inoxidable"],
            infoMaterials: ["Vinilo de Corte", "Impresión Digital", "Letras 3D", "Grabado Láser", "Serigrafía"],
            authorizedUsers: [{ name: "Admin", isAdmin: true, pin: "1234" }],
          };
          setDoc(configRef, def);
          setConfig(def);
        }
      },
      (err) => console.error("Error Config:", err)
    );

    const itemsRef = collection(db, "artifacts", APP_ID, "public", "data", "rotulos");
    const unsubItems = onSnapshot(
      itemsRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setItems(data);
      },
      (err) => console.error("Error Items:", err)
    );

    return () => {
      unsubConfig();
      unsubItems();
    };
  }, [firebaseUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    const nameInput = e.target.username.value.trim().toLowerCase();
    const pinInput = e.target.pin?.value.trim();

    const found = (config.authorizedUsers || []).find(
      (u) => (u.name || "").toLowerCase() === nameInput
    );

    if (found) {
      if (found.isAdmin && found.pin !== pinInput) {
        notify("PIN incorrecto", "error");
        return;
      }
      const session = { ...found, uid: firebaseUser?.uid || "" };
      setUser(session);
      localStorage.setItem("hospital_session", JSON.stringify(session));
      setView("form");
      notify("Bienvenido " + found.name);
    } else {
      notify("Usuario no registrado", "error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hospital_session");
    setView("login");
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 800;
          const scale = img.width > MAX ? MAX / img.width : 1; // no agrandar
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
    });
  };

  const handlePhoto = async (e) => {
    if ((formData.fotos || []).length >= 3) return;
    setIsCompressing(true);
    const file = e.target.files?.[0];
    if (file) {
      const res = await compressImage(file);
      setFormData((prev) => ({
        ...prev,
        fotos: [...(prev.fotos || []), res].slice(0, 3),
      }));
    }
    setIsCompressing(false);
  };

  const saveRecord = async () => {
    const required = ["piso", "servicio", "tipoSenal", "tipologia", "material", "materialInfo"];
    const missing = required.filter((k) => !String(formData[k] || "").trim());
    if (missing.length > 0) {
      notify("Complete los campos obligatorios", "error");
      return;
    }

    setLoading(true);
    try {
      const colRef = collection(db, "artifacts", APP_ID, "public", "data", "rotulos");
      const qty = Math.max(1, Number(formData.cantidad || 1));

      // Guardamos UN documento con cantidad (como tu nuevo HTML), NO uno por unidad
      await addDoc(colRef, {
        ...formData,
        cantidad: qty,
        codigo: `ROT-${Date.now().toString().slice(-4)}`,
        fecha: new Date().toLocaleDateString(),
        responsable: user?.name || "Sin nombre",
        timestamp: serverTimestamp(),
      });

      setFormData(initialForm);
      setView("list");
      notify("Registro guardado");
    } catch (e) {
      console.error(e);
      notify("Error al guardar", "error");
    }
    setLoading(false);
  };

  const updateGlobalConfig = async (newConfig) => {
    setLoading(true);
    try {
      const ref = doc(db, "artifacts", APP_ID, "public", "data", "config", "global");
      await updateDoc(ref, newConfig);
      notify("Configuración actualizada");
    } catch (e) {
      console.error(e);
      notify("Error al guardar config", "error");
    }
    setLoading(false);
  };

  // --- Loading inicial ---
  if (loading && !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e55e51]" />
      </div>
    );
  }

  // --- Login ---
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="mb-10 w-full max-w-[200px] animate-in zoom-in-50 duration-700">
          <HospitalLogo className="w-full h-auto" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12 text-center">
          Levantamiento de Inventario
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input
            name="username"
            required
            placeholder="Usuario"
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-red-200 transition-all font-medium text-center"
          />
          <input
            name="pin"
            type="password"
            placeholder="PIN (Admin)"
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-red-200 transition-all font-medium text-center"
          />
          <Button type="submit" className="w-full py-5 text-lg">
            Acceder
          </Button>
        </form>

        {notification && (
          <div
            className={`mt-6 text-xs font-black uppercase tracking-widest ${
              notification.type === "error" ? "text-red-500" : "text-emerald-500"
            }`}
          >
            {notification.msg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-32" style={{ fontFamily: BRAND.font }}>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-4">
          <HospitalLogo className="h-8 w-auto" />
          <div className="h-6 w-px bg-gray-100" />
          <div>
            <div className="text-[10px] font-black text-[#e55e51] uppercase tracking-tighter">
              {user.isAdmin ? "Administrador" : "Instalador"}
            </div>
            <div className="font-bold text-gray-700 text-sm leading-none">{user.name}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {notification && (
        <div
          className={`fixed top-20 left-6 right-6 z-50 p-4 rounded-2xl shadow-lg text-white text-sm font-bold flex items-center gap-3 animate-bounce ${
            notification.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {notification.type === "error" ? <XCircle size={18} /> : <CheckCircle size={18} />}{" "}
          {notification.msg}
        </div>
      )}

      <main className="p-6 max-w-md mx-auto space-y-8">
        {/* FORM */}
        {view === "form" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Ubicación y Clasificación */}
            <Card className="p-6 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase">
                Ubicación y Clasificación
              </label>

              <select
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
                value={formData.piso}
                onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
              >
                <option value="">Seleccionar Piso</option>
                {config.floors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <select
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none"
                value={formData.servicio}
                onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
              >
                <option value="">Seleccionar Área / Servicio</option>
                {config.services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-t border-gray-100"
                value={formData.tipoSenal}
                onChange={(e) => setFormData({ ...formData, tipoSenal: e.target.value })}
              >
                <option value="">Seleccionar Tipo de Señal</option>
                {config.signalTypes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </Card>

            {/* Tipología */}
            <Card className="p-6 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Tipología de Soporte
              </label>
              <div className="flex flex-wrap gap-2">
                {config.typologies.map((t) => (
                  <PillButton
                    key={t}
                    active={formData.tipologia === t}
                    onClick={() => setFormData({ ...formData, tipologia: t })}
                    activeClass="bg-[#e55e51] text-white border-[#e55e51] shadow-md"
                    inactiveClass="bg-white text-gray-400 border-gray-100"
                  >
                    {t}
                  </PillButton>
                ))}
              </div>
            </Card>

            {/* Material base */}
            <Card className="p-6 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Material Base
              </label>
              <div className="flex flex-wrap gap-2">
                {config.materials.map((m) => (
                  <PillButton
                    key={m}
                    active={formData.material === m}
                    onClick={() => setFormData({ ...formData, material: m })}
                    activeClass="bg-gray-800 text-white border-gray-800 shadow-md"
                    inactiveClass="bg-white text-gray-400 border-gray-100"
                  >
                    {m}
                  </PillButton>
                ))}
              </div>
            </Card>

            {/* Material info */}
            <Card className="p-6 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Gráfica / Vinilos
              </label>
              <div className="flex flex-wrap gap-2">
                {config.infoMaterials.map((im) => (
                  <PillButton
                    key={im}
                    active={formData.materialInfo === im}
                    onClick={() => setFormData({ ...formData, materialInfo: im })}
                    activeClass="bg-indigo-600 text-white border-indigo-600 shadow-md"
                    inactiveClass="bg-white text-gray-400 border-gray-100"
                  >
                    {im}
                  </PillButton>
                ))}
              </div>
            </Card>

            {/* Dimensiones y Cantidad */}
            <Card className="p-6 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Dimensiones y Cantidad
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[8px] font-bold text-gray-300 ml-1">Ancho (cm)</span>
                  <input
                    type="number"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-center font-bold"
                    value={formData.ancho}
                    onChange={(e) => setFormData({ ...formData, ancho: e.target.value })}
                  />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-gray-300 ml-1">Largo (cm)</span>
                  <input
                    type="number"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-center font-bold"
                    value={formData.largo}
                    onChange={(e) => setFormData({ ...formData, largo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <span className="text-[8px] font-bold text-gray-300 ml-1">Espesor (mm)</span>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-center font-bold"
                  value={formData.espesor}
                  onChange={(e) => setFormData({ ...formData, espesor: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl mt-2">
                <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Cantidad</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cantidad: Math.max(1, Number(formData.cantidad || 1) - 1),
                      })
                    }
                    className="p-2 text-gray-300"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-black text-lg">{formData.cantidad}</span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        cantidad: Math.max(1, Number(formData.cantidad || 1) + 1),
                      })
                    }
                    className="p-2 text-[#e55e51]"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </Card>

            {/* Iluminación */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  ¿Iluminación?
                </label>
                <button
                  onClick={() =>
                    setFormData({ ...formData, tieneIluminacion: !formData.tieneIluminacion })
                  }
                  className={`p-3 rounded-xl transition-colors ${
                    formData.tieneIluminacion
                      ? "bg-amber-100 text-amber-600"
                      : "bg-gray-100 text-gray-300"
                  }`}
                >
                  {formData.tieneIluminacion ? <Zap size={18} /> : <ZapOff size={18} />}
                </button>
              </div>

              {formData.tieneIluminacion && (
                <input
                  placeholder="Especificar (LED, Caja, etc.)"
                  className="w-full p-4 bg-amber-50 rounded-2xl border border-amber-100 outline-none font-bold text-sm"
                  value={formData.especificacionIluminacion}
                  onChange={(e) =>
                    setFormData({ ...formData, especificacionIluminacion: e.target.value })
                  }
                />
              )}
            </Card>

            {/* Fotos */}
            <Card className="p-6 space-y-4 text-center">
              <label className="block text-[10px] font-black text-gray-400 uppercase">
                Evidencia Fotográfica ({(formData.fotos || []).length}/3)
              </label>

              <div className="grid grid-cols-3 gap-3">
                {(formData.fotos || []).map((f, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border relative group shadow-sm">
                    <img src={f} className="w-full h-full object-cover" />
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          fotos: (formData.fotos || []).filter((_, idx) => idx !== i),
                        })
                      }
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {(formData.fotos || []).length < 3 && (
                  <label className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 cursor-pointer">
                    {isCompressing ? (
                      <div className="animate-spin h-6 w-6 border-2 border-[#e55e51] border-t-transparent rounded-full mb-1" />
                    ) : (
                      <Camera className="mb-1" />
                    )}
                    <span className="text-[8px] font-bold uppercase">Capturar</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handlePhoto}
                    />
                  </label>
                )}
              </div>
            </Card>

            <Button
              onClick={saveRecord}
              className="w-full py-6 text-sm rounded-[2rem] font-black uppercase tracking-widest shadow-2xl"
            >
              Guardar Registro
            </Button>
          </div>
        )}

        {/* LIST */}
        {view === "list" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-800">Registros Recientes</h2>

            {items.length === 0 ? (
              <div className="text-center py-20 text-gray-300 font-bold text-xs uppercase">
                Sin registros
              </div>
            ) : (
              items.map((it) => (
                <Card key={it.id} className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border flex-shrink-0 flex items-center justify-center">
                    {it.fotos?.[0] ? (
                      <img src={it.fotos[0]} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-200" size={22} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-[#e55e51] uppercase bg-red-50 px-1.5 py-0.5 rounded">
                        {it.codigo}
                      </span>
                      <span className="text-[9px] font-black text-gray-400 uppercase truncate">
                        {it.tipoSenal || "S/T"}
                      </span>
                    </div>

                    <div className="font-black text-gray-800 truncate leading-tight">
                      {it.servicio}
                    </div>

                    <div className="text-[10px] text-gray-400 font-bold mt-1">
                      {(it.tipologia || "S/T")} · {(it.material || "S/M")} / {(it.materialInfo || "S/G")}
                      <br />
                      {(it.piso || "S/P")} · {(it.cantidad || 1)} ud.
                    </div>
                  </div>

                  {user.isAdmin && (
                    <button
                      onClick={() =>
                        deleteDoc(doc(db, "artifacts", APP_ID, "public", "data", "rotulos", it.id))
                      }
                      className="p-2 text-gray-200 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* ADMIN */}
        {view === "admin" && user.isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-800 px-1 flex items-center gap-2">
              <Settings size={18} /> Configuración
            </h2>

            {/* Config de catálogos (como tu HTML) */}
            <Card className="p-6 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Tipos de Señal
              </label>
              <textarea
                id="edit-signalTypes"
                defaultValue={(config.signalTypes || []).join("\n")}
                className="w-full p-4 bg-gray-50 rounded-2xl h-24 outline-none text-xs font-mono font-bold border-none"
              />

              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Servicios / Áreas
              </label>
              <textarea
                id="edit-services"
                defaultValue={(config.services || []).join("\n")}
                className="w-full p-4 bg-gray-50 rounded-2xl h-24 outline-none text-xs font-mono font-bold border-none"
              />

              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Tipologías de Soporte
              </label>
              <textarea
                id="edit-typologies"
                defaultValue={(config.typologies || []).join("\n")}
                className="w-full p-4 bg-gray-50 rounded-2xl h-24 outline-none text-xs font-mono font-bold border-none"
              />

              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Materiales Base
              </label>
              <textarea
                id="edit-materials"
                defaultValue={(config.materials || []).join("\n")}
                className="w-full p-4 bg-gray-50 rounded-2xl h-24 outline-none text-xs font-mono font-bold border-none"
              />

              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Materiales de Información
              </label>
              <textarea
                id="edit-infoMaterials"
                defaultValue={(config.infoMaterials || []).join("\n")}
                className="w-full p-4 bg-gray-50 rounded-2xl h-24 outline-none text-xs font-mono font-bold border-none"
              />

              <Button
                variant="dark"
                className="w-full"
                onClick={() => {
                  const signalTypes = document
                    .getElementById("edit-signalTypes")
                    .value.split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const services = document
                    .getElementById("edit-services")
                    .value.split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const typologies = document
                    .getElementById("edit-typologies")
                    .value.split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const materials = document
                    .getElementById("edit-materials")
                    .value.split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  const infoMaterials = document
                    .getElementById("edit-infoMaterials")
                    .value.split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  updateGlobalConfig({
                    ...config,
                    signalTypes,
                    services,
                    typologies,
                    materials,
                    infoMaterials,
                  });
                }}
              >
                Guardar Cambios
              </Button>
            </Card>

            {/* Usuarios (lo que ya tenías) */}
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 mt-4">
              <UserCheck size={16} /> Control de Personal
            </h3>

            <Card className="p-6 space-y-4">
              {(config.authorizedUsers || []).map((u, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className={`text-sm font-bold ${u.isAdmin ? "text-red-500" : "text-gray-700"}`}>
                      {u.name}
                    </div>
                    <div className="text-[8px] uppercase text-gray-400 tracking-widest font-black">
                      {u.isAdmin ? `Admin (PIN: ${u.pin})` : "Instalador"}
                    </div>
                  </div>

                  {u.name !== "Admin" && (
                    <button
                      onClick={() => {
                        const copy = [...config.authorizedUsers];
                        copy.splice(i, 1);
                        updateGlobalConfig({ ...config, authorizedUsers: copy });
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t space-y-3">
                <input
                  id="u_name"
                  placeholder="Nombre completo"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-medium"
                />
                <div className="flex gap-2">
                  <input
                    id="u_pin"
                    placeholder="PIN (opcional)"
                    className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none text-sm font-medium"
                  />
                  <button
                    onClick={() => {
                      const n = document.getElementById("u_name").value.trim();
                      const p = document.getElementById("u_pin").value.trim();
                      if (n) {
                        updateGlobalConfig({
                          ...config,
                          authorizedUsers: [
                            ...(config.authorizedUsers || []),
                            { name: n, pin: p, isAdmin: !!p },
                          ],
                        });
                        document.getElementById("u_name").value = "";
                        document.getElementById("u_pin").value = "";
                      }
                    }}
                    className="bg-gray-800 text-white px-6 rounded-2xl font-black transition-transform active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* NAV */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/90 backdrop-blur-xl rounded-[35px] border border-gray-100 shadow-2xl flex justify-around items-center px-4 z-50">
        <button
          onClick={() => setView("form")}
          className={`p-4 rounded-2xl transition-all ${
            view === "form" ? "bg-[#f9dcd1] text-[#e55e51] scale-110" : "text-gray-300 hover:text-gray-400"
          }`}
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => setView("list")}
          className={`p-4 rounded-2xl transition-all ${
            view === "list" ? "bg-[#f9dcd1] text-[#e55e51] scale-110" : "text-gray-300"
          }`}
        >
          <Database size={24} />
        </button>

        {user.isAdmin && (
          <button
            onClick={() => setView("admin")}
            className={`p-4 rounded-2xl transition-all ${
              view === "admin" ? "bg-[#f9dcd1] text-[#e55e51] scale-110" : "text-gray-300"
            }`}
          >
            <Settings size={24} />
          </button>
        )}
      </nav>
    </div>
  );
}