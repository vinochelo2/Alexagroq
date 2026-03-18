'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Mic, 
  Settings, 
  Shield, 
  Zap, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  Info,
  AlertCircle,
  LogIn,
  LogOut,
  User,
  MapPin,
  Globe,
  Save,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSelectedModel, setSelectedModel, FALLBACK_MODELS } from '@/lib/config';
import { auth, loginWithGoogle, logout, db } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [user, loading, error] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('setup');
  const [selectedModel, setModel] = useState(FALLBACK_MODELS[0]);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Estados para preferencias
  const [alexaUserId, setAlexaUserId] = useState('');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Inicializar estado del cliente
  useEffect(() => {
    setMounted(true);
    setModel(getSelectedModel());
  }, []);

  // Cargar perfil y preferencias de usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAlexaUserId(data.alexaUserId || '');
          setCity(data.preferences?.city || '');
        }

        // Asegurar que el perfil básico esté guardado
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
          createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : new Date().toISOString()
        }, { merge: true });
      }
    };
    
    loadUserData().catch(err => console.error("Error loading/saving user profile:", err));
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        alexaUserId,
        preferences: {
          city
        }
      }, { merge: true });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Error saving preferences:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setModel(model);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const alexaInteractionModel = {
    "interactionModel": {
      "languageModel": {
        "invocationName": "super ia",
        "intents": [
          {
            "name": "GroqIntent",
            "slots": [
              {
                "name": "Query",
                "type": "AMAZON.SearchQuery"
              }
            ],
            "samples": [
              "{Query}",
              "pregunta {Query}",
              "dime {Query}",
              "consulta {Query}",
              "busca {Query}",
              "qué es {Query}",
              "quién es {Query}",
              "dónde está {Query}",
              "cómo llegar a {Query}",
              "restaurantes en {Query}",
              "qué hay cerca de {Query}"
            ]
          },
          {
            "name": "AMAZON.CancelIntent",
            "samples": []
          },
          {
            "name": "AMAZON.HelpIntent",
            "samples": []
          },
          {
            "name": "AMAZON.StopIntent",
            "samples": []
          },
          {
            "name": "AMAZON.FallbackIntent",
            "samples": []
          },
          {
            "name": "AMAZON.NavigateHomeIntent",
            "samples": []
          }
        ],
        "types": []
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Super IA <span className="text-indigo-400 text-xs font-normal ml-1">v2.0</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-3 bg-white/5 pl-1 pr-3 py-1 rounded-full border border-white/10">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt={user.displayName || ""} width={28} height={28} className="rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-xs font-medium text-white hidden sm:inline">{user.displayName?.split(' ')[0]}</span>
                <button 
                  onClick={() => logout()}
                  className="p-1 hover:text-red-400 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => loginWithGoogle()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
              >
                <LogIn className="w-4 h-4" />
                Conectar Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar / Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <button 
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'setup' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
            <button 
              onClick={() => setActiveTab('model')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'model' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <MessageSquare className="w-4 h-4" />
              Modelo Alexa
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <User className="w-4 h-4" />
              Perfil y Memoria
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <Shield className="w-4 h-4" />
              Seguridad y IA
            </button>

            <div className="pt-8 px-4">
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Nuevo: Maps</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ahora Super IA usa <strong>Gemini 2.5 Flash</strong> con Google Maps para darte información real de lugares.
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'setup' && (
                <motion.div 
                  key="setup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-2">Configuración de la Skill</h2>
                    <p className="text-slate-400 text-sm mb-6">Configura los parámetros técnicos para conectar Alexa con Groq y Gemini.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Endpoint URL</span>
                          <button 
                            onClick={() => copyToClipboard("https://ais-dev-pnotxe5savp25y2s7g3fc7-107312334344.us-east5.run.app/api/alexa", "url")}
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            {copied === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-sm font-mono text-white break-all bg-black/40 p-3 rounded-lg border border-white/5">
                          https://ais-dev-pnotxe5savp25y2s7g3fc7-107312334344.us-east5.run.app/api/alexa
                        </p>
                        <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                          <Info className="w-3 h-3" />
                          Pega esto en &quot;HTTPS Endpoint&quot; en la consola de Alexa.
                        </p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-4">Modelo Principal (Groq)</span>
                        <div className="space-y-3">
                          {!mounted ? (
                            <div className="h-48 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            </div>
                          ) : (
                            FALLBACK_MODELS.map((model) => (
                              <button
                                key={model}
                                onClick={() => handleModelChange(model)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border ${selectedModel === model ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'}`}
                              >
                                <span className="font-mono text-xs">{model}</span>
                                {selectedModel === model && <Check className="w-4 h-4" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-indigo-400" />
                        Próximos Pasos
                      </h3>
                      <ol className="space-y-4 mt-6">
                        <li className="flex gap-4">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">1</span>
                          <p className="text-sm text-slate-300">Ve a la <a href="https://developer.amazon.com/alexa/console/ask" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">Consola de Desarrolladores de Alexa <ExternalLink className="w-3 h-3" /></a>.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">2</span>
                          <p className="text-sm text-slate-300">Crea una Skill con el nombre de invocación <strong>&quot;super ia&quot;</strong>.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">3</span>
                          <p className="text-sm text-slate-300">Configura el Endpoint HTTPS con la URL de arriba y selecciona <strong>&quot;My endpoint has a certificate from a trusted certificate authority&quot;</strong>.</p>
                        </li>
                      </ol>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
                  </section>
                </motion.div>
              )}

              {activeTab === 'model' && (
                <motion.div 
                  key="model"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Modelo de Interacción</h2>
                      <p className="text-slate-400 text-sm">Copia este JSON en el &quot;JSON Editor&quot; de tu Skill en Alexa.</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(JSON.stringify(alexaInteractionModel, null, 2), "json")}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10"
                    >
                      {copied === 'json' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied === 'json' ? 'Copiado' : 'Copiar JSON'}
                    </button>
                  </div>
                  
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-6 overflow-hidden">
                    <pre className="text-xs font-mono text-indigo-300/80 overflow-x-auto max-h-[500px] custom-scrollbar">
                      {JSON.stringify(alexaInteractionModel, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-2">Perfil y Memoria</h2>
                    <p className="text-slate-400 text-sm mb-8">Personaliza lo que Super IA sabe sobre ti cuando hablas por Alexa.</p>
                    
                    {!user ? (
                      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
                        <User className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Inicia sesión para personalizar</h3>
                        <p className="text-sm text-slate-400 mb-6">Necesitas conectar tu cuenta de Google para guardar tus preferencias y vincular Alexa.</p>
                        <button 
                          onClick={() => loginWithGoogle()}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full text-sm font-medium transition-all"
                        >
                          Conectar Google
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">ID de Usuario Alexa</label>
                            <input 
                              type="text" 
                              value={alexaUserId}
                              onChange={(e) => setAlexaUserId(e.target.value)}
                              placeholder="amzn1.ask.account.XXXX"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all font-mono"
                            />
                            <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                              Puedes encontrar este ID en los logs de tu Skill o preguntando &quot;Alexa, ¿cuál es mi ID?&quot; (si has configurado una respuesta para ello). Esto vincula tu voz con este perfil.
                            </p>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Ciudad Predeterminada</label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input 
                                type="text" 
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Ej: Madrid, España"
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                              />
                            </div>
                            <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                              Super IA usará esta ciudad para darte el clima, noticias locales y recomendaciones si no especificas otra.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                              <Database className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">Guardar en la Nube</h4>
                              <p className="text-xs text-slate-500">Tus preferencias se sincronizan al instante.</p>
                            </div>
                          </div>
                          <button 
                            onClick={savePreferences}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${saveStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'} disabled:opacity-50`}
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : saveStatus === 'success' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {saveStatus === 'success' ? '¡Guardado!' : 'Guardar Cambios'}
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-2">Seguridad y Privacidad</h2>
                    <p className="text-slate-400 text-sm mb-8">Cómo protegemos tus datos y qué tecnologías de IA estamos utilizando.</p>
                    
                    <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold mb-1">Firebase Authentication</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              Usamos Google Sign-In para identificarte de forma segura. No almacenamos tus contraseñas. Tus datos de perfil se guardan en Firestore con reglas de seguridad estrictas.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold mb-1">Google Maps Grounding</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              Para consultas sobre lugares, usamos <strong>Gemini 2.5 Flash</strong>. Esta tecnología permite a la IA consultar Google Maps en tiempo real para darte horarios, direcciones y valoraciones reales de negocios.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold mb-1">Groq Cloud API</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              Para preguntas generales, usamos la infraestructura de Groq, que ofrece la latencia más baja del mercado, asegurando que Alexa te responda casi instantáneamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Super IA Project</span>
            <ChevronRight className="w-3 h-3" />
            <span>2026</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Términos</a>
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Documentación API</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
