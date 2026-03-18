"use client";

import React from 'react';
import { Terminal, Code, Settings, Mic, ExternalLink, CircleCheck, AlertCircle, Play, Loader2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Alexa + Groq</h1>
          </div>
          <a
            href="https://developer.amazon.com/alexa/console/ask"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            Alexa Developer Console <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Dale superpoderes a tu Alexa con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Groq</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Esta aplicación actúa como el &quot;cerebro&quot; (backend) de tu nueva Skill de Alexa. 
            Sigue esta guía paso a paso para conectar tu dispositivo Echo con la inteligencia artificial ultrarrápida de Groq.
          </p>
        </section>

        {/* Prerequisites */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CircleCheck className="w-6 h-6 text-emerald-500" />
            Requisitos Previos
          </h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 mt-0.5">
                <Terminal className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Cuenta en Groq</p>
                <p className="text-sm text-slate-500 mt-1">Necesitas una API Key de Groq. Puedes obtenerla de forma gratuita en <a href="https://console.groq.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">console.groq.com</a>.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 mt-0.5">
                <Settings className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Cuenta de Amazon Developer</p>
                <p className="text-sm text-slate-500 mt-1">Para crear la Skill. Usa la misma cuenta de Amazon que tienes en tu dispositivo Alexa.</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Steps */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Guía de Configuración</h3>

          {/* Step 1 */}
          <StepCard 
            number="1" 
            title="Configura tu API Key de Groq"
            description="Antes de publicar este proyecto en Vercel, asegúrate de configurar la variable de entorno."
          >
            <div className="bg-slate-900 rounded-xl p-4 mt-4 overflow-x-auto">
              <code className="text-sm text-emerald-400 font-mono">
                GROQ_API_KEY=&quot;tu_clave_secreta_aqui&quot;
              </code>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              En Vercel, ve a Settings &gt; Environment Variables y añade <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">GROQ_API_KEY</code>.
            </p>
          </StepCard>

          {/* Tester */}
          <GroqTester />

          {/* Step 2 */}
          <StepCard 
            number="2" 
            title="Crea la Skill en Alexa Developer Console"
            description="Vamos a crear la interfaz de voz en Amazon."
          >
            <ol className="list-decimal list-inside space-y-3 text-slate-700 mt-4 ml-2">
              <li>Ve a la <a href="https://developer.amazon.com/alexa/console/ask" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">Alexa Developer Console</a> y haz clic en <strong>Create Skill</strong>.</li>
              <li><strong>Name, Locale:</strong> Ponle un nombre (ej. &quot;Asistente Groq&quot;) y elige tu idioma. Haz clic en <strong>Next</strong>.</li>
              <li><strong>Experience, Model, Hosting:</strong> Selecciona <strong>Other</strong> &gt; <strong>Custom</strong> y en Hosting elige <strong>Provision your own</strong>. Haz clic en <strong>Next</strong>.</li>
              <li><strong>Templates:</strong> Selecciona la opción <strong>Start from Scratch</strong> (la primera caja). Haz clic en <strong>Next</strong>.</li>
              <li><strong>Review:</strong> Revisa los datos y haz clic en <strong>Create Skill</strong>.</li>
            </ol>
          </StepCard>

          {/* Step 3 */}
          <StepCard 
            number="3" 
            title="Configura el Modelo de Interacción (JSON)"
            description="Alexa necesita saber qué frases activarán a Groq. La forma más fácil es pegar este código JSON."
          >
            <ol className="list-decimal list-inside space-y-3 text-slate-700 mt-4 ml-2 mb-4">
              <li>En el menú izquierdo de la consola de Alexa, ve a <strong>Interaction Model &gt; JSON Editor</strong>.</li>
              <li>Borra todo el contenido que haya y pega el siguiente código:</li>
            </ol>
            <div className="relative group">
              <div className="absolute right-4 top-4">
                <CopyButton text={interactionModelJson} />
              </div>
              <pre className="bg-slate-900 text-slate-300 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed">
                {interactionModelJson}
              </pre>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Después de pegar, haz clic en <strong>Save Model</strong> y luego en <strong>Build Model</strong> (arriba a la izquierda). Espera a que termine de construir.
            </p>
          </StepCard>

          {/* Step 4 */}
          <StepCard 
            number="4" 
            title="Conecta Alexa con este proyecto (Endpoint)"
            description="Ahora le diremos a Alexa a dónde enviar las preguntas."
          >
            <ol className="list-decimal list-inside space-y-3 text-slate-700 mt-4 ml-2">
              <li>En el menú izquierdo, ve a <strong>Endpoint</strong>.</li>
              <li>Selecciona <strong>HTTPS</strong>.</li>
              <li>En <strong>Default Region</strong>, pega la URL de tu proyecto en Vercel añadiendo <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">/api/alexa</code> al final.
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-3 rounded-lg mt-2 text-sm">
                  Ejemplo: <strong>https://tu-proyecto.vercel.app/api/alexa</strong>
                </div>
              </li>
              <li>En el menú desplegable de abajo (Select SSL certificate type), elige la opción: <br/>
                <strong className="text-sm">&quot;My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority&quot;</strong>.
              </li>
              <li>Haz clic en <strong>Save Endpoints</strong>.</li>
            </ol>
          </StepCard>

          {/* Step 5 */}
          <StepCard 
            number="5" 
            title="¡Pruébalo!"
            description="Ya está todo listo. Vamos a probar si funciona."
          >
            <ol className="list-decimal list-inside space-y-3 text-slate-700 mt-4 ml-2">
              <li>Ve a la pestaña <strong>Test</strong> en el menú superior de la consola de Alexa.</li>
              <li>Donde dice &quot;Skill testing is enabled in&quot;, cambia de &quot;Off&quot; a <strong>Development</strong>.</li>
              <li>En el cuadro de texto (o usando tu micrófono), escribe: <br/>
                <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-medium mt-2 inline-block">abre mi asistente groq y dime qué es la física cuántica</code>
              </li>
            </ol>
            
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Nota sobre Certificación</p>
                <p>
                  Esta configuración es perfecta para uso personal (la skill funcionará en todos los dispositivos Echo conectados a tu cuenta). 
                  Si en el futuro deseas publicar la skill para que todo el mundo la descargue, Amazon requerirá que el endpoint valide las firmas criptográficas de las peticiones.
                </p>
              </div>
            </div>
          </StepCard>
        </div>
      </main>
    </div>
  );
}

function StepCard({ number, title, description, children }: { number: string, title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
          {number}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-slate-900">{title}</h4>
          <p className="text-slate-600 mt-1">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-700"
    >
      <Code className="w-3.5 h-3.5" />
      {copied ? '¡Copiado!' : 'Copiar JSON'}
    </button>
  );
}

function GroqTester() {
  const [model, setModel] = React.useState('');
  const [activeModel, setActiveModel] = React.useState('');
  const [availableModels, setAvailableModels] = React.useState<{id: string}[]>([]);
  const [prompt, setPrompt] = React.useState('Hola, ¿qué modelo eres y qué puedes hacer?');
  const [response, setResponse] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingModels, setLoadingModels] = React.useState(false);
  const [savingModel, setSavingModel] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isManualModel, setIsManualModel] = React.useState(false);

  React.useEffect(() => {
    fetchModels();
    fetchActiveModel();
  }, []);

  const fetchActiveModel = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.model) {
          setActiveModel(data.model);
          setModel(data.model);
        }
      }
    } catch (err) {
      console.error("Error fetching active model:", err);
    }
  };

  const handleSaveModel = async () => {
    setSavingModel(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      
      if (!res.ok) throw new Error('Error al guardar el modelo');
      
      const data = await res.json();
      setActiveModel(data.model);
      setSuccessMsg(`¡Modelo ${data.model} guardado para Alexa!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingModel(false);
    }
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    setError('');
    try {
      const res = await fetch('/api/models');
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor no devolvió JSON. Verifica los logs del servidor.");
      }
      
      const data = await res.json();
      
      if (res.ok && data.models) {
        const chatModels = data.models.filter((m: any) => 
          !m.id.includes('embed') && 
          !m.id.includes('whisper') && 
          !m.id.includes('guard')
        );
        
        // Asegurar que los modelos de respaldo estén en la lista si no aparecen en la API
        const fallbackModels = [
          "openai/gpt-oss-120b",
          "llama-3.3-70b-versatile",
          "qwen/qwen3-32b"
        ];
        
        const combinedModels = [...chatModels];
        fallbackModels.forEach(fm => {
          if (!combinedModels.find(m => m.id === fm)) {
            combinedModels.unshift({ id: fm });
          }
        });

        setAvailableModels(combinedModels);
        if (combinedModels.length > 0) {
          setModel(combinedModels[0].id);
          setIsManualModel(false);
        } else {
          setIsManualModel(true);
        }
      } else {
        setError(data.error || 'Error al cargar modelos');
        setIsManualModel(true);
      }
    } catch (err: any) {
      console.error("Error fetching models:", err);
      setError(err.message || "Error de conexión al obtener modelos");
      setIsManualModel(true);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const res = await fetch('/api/test-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor no devolvió JSON. Verifica los logs del servidor.");
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      setResponse(data.response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm mt-8">
      <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
        <Play className="w-5 h-5 text-indigo-600" />
        Paso 1.5: Tester y Configuración de Modelos Groq
      </h4>
      <p className="text-slate-600 mb-6">Prueba tu API Key y verifica qué modelo funciona mejor. Una vez que encuentres tu favorito, guárdalo para que Alexa lo use automáticamente (o configura la variable <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 text-sm">GROQ_MODEL</code> si lo publicas en Vercel).</p>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modelo Seleccionado</label>
            <div className="flex gap-2">
              {isManualModel ? (
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ej: llama3-8b-8192"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loadingModels || availableModels.length === 0}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {availableModels.length === 0 && <option value="">Cargando modelos...</option>}
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.id}</option>
                  ))}
                </select>
              )}
              <button 
                onClick={() => setIsManualModel(!isManualModel)} 
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 text-sm whitespace-nowrap"
                title="Alternar entrada manual"
              >
                {isManualModel ? "Lista" : "Manual"}
              </button>
              <button 
                onClick={fetchModels} 
                disabled={loadingModels}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                title="Recargar modelos"
              >
                {loadingModels ? <Loader2 className="w-4 h-4 animate-spin" /> : "↻"}
              </button>
            </div>
            {activeModel && (
              <p className="text-xs text-slate-500 mt-2">
                Modelo actual en Alexa: <span className="font-semibold text-indigo-600">{activeModel}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje de prueba</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Escribe algo..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleTest}
            disabled={loading || !prompt}
            className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Probar Modelo
          </button>
          <button
            onClick={handleSaveModel}
            disabled={savingModel || !model || model === activeModel}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            {savingModel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            Usar este modelo en Alexa
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-200 flex items-center gap-2">
            <CircleCheck className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {response && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Respuesta de {model}</p>
            <p className="text-slate-800 whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const interactionModelJson = `{
  "interactionModel": {
    "languageModel": {
      "invocationName": "mi asistente groq",
      "intents": [
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
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "GroqIntent",
          "slots": [
            {
              "name": "Query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "pregúntale a groq {Query}",
            "qué opina groq de {Query}",
            "dime {Query}",
            "qué es {Query}",
            "quién es {Query}"
          ]
        }
      ],
      "types": []
    }
  }
}`;
