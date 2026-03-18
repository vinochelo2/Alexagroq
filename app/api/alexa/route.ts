import { NextResponse } from 'next/server';
import { getSelectedModel, FALLBACK_MODELS } from '@/lib/config';
import * as Sentry from "@sentry/nextjs";
import { GoogleGenAI } from "@google/genai";
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface UserContext {
  name?: string;
  city?: string;
  interests?: string[];
  userId?: string;
}

export async function GET() {
  return NextResponse.json({ status: "ok", message: "El endpoint de Alexa está funcionando correctamente." });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const requestType = body?.request?.type;

    if (!requestType) {
      return NextResponse.json({ error: "Invalid Alexa request format" }, { status: 400 });
    }

    // 1. Manejar cuando el usuario abre la skill ("Alexa, abre mi asistente groq")
    if (requestType === 'LaunchRequest') {
      return NextResponse.json(
        buildAlexaResponse("Hola, soy Super IA. ¿Qué quieres saber?", false)
      );
    }

    // 2. Manejar las intenciones (cuando el usuario hace una pregunta)
    if (requestType === 'IntentRequest') {
      const intentName = body.request.intent.name;
      const alexaUserId = body.session?.user?.userId;
      
      // Obtener contexto del usuario si existe
      let userContext: UserContext = {};
      if (alexaUserId) {
        userContext = await getUserContext(alexaUserId);
      }

      if (intentName === 'GroqIntent' || intentName === 'AMAZON.FallbackIntent') {
        // Obtener la pregunta del usuario desde el slot "Query"
        const query =
          body.request.intent.slots?.Query?.value ||
          body.request.intent.slots?.query?.value;

        if (!query) {
          // Si es FallbackIntent o no hay query, pedimos que repita de forma más amable
          return NextResponse.json(
            buildAlexaResponse("No estoy seguro de haberte entendido. ¿Puedes repetirlo o preguntarme de otra forma?", false)
          );
        }

        // Decidir si usar Gemini con Grounding o Groq
        let responseText = "";
        const isPlaceQuery = /dónde|donde|restaurante|lugar|ubicación|dirección|cerca|mapa|cómo llegar/i.test(query);
        const isInternetQuery = /internet|noticias|hoy|actualidad|quién es|quién ganó|clima|tiempo/i.test(query);

        if (isPlaceQuery || isInternetQuery) {
          responseText = await callGeminiWithGrounding(query, userContext, isPlaceQuery);
        } else {
          responseText = await callGroq(query, userContext);
        }
        
        // Guardar interacción en Firestore (opcional, de fondo)
        if (alexaUserId) {
          saveInteraction(alexaUserId, query, responseText, isPlaceQuery || isInternetQuery ? "Gemini" : "Groq");
        }

        // Devolver la respuesta a Alexa
        return NextResponse.json(buildAlexaResponse(responseText, false));
      }

      // Intenciones por defecto de Amazon (Parar, Cancelar)
      if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        return NextResponse.json(buildAlexaResponse("Hasta luego.", true));
      }
      
      if (intentName === 'AMAZON.HelpIntent') {
        return NextResponse.json(buildAlexaResponse("Puedes preguntarme cualquier cosa. Por ejemplo, dime qué es la física cuántica o dónde hay una pizzería cerca.", false));
      }
    }

    // 3. Manejar cuando la sesión termina
    if (requestType === 'SessionEndedRequest') {
      return NextResponse.json({}, { status: 200 });
    }

    // Respuesta por defecto si no entendemos la solicitud
    return NextResponse.json(
      buildAlexaResponse("Lo siento, soy Super IA y no entendí eso.", false)
    );
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error en el endpoint de Alexa:", error);
    return NextResponse.json(
      buildAlexaResponse("Hubo un error al procesar tu solicitud.", true)
    );
  }
}

// Función auxiliar para construir la respuesta en el formato que espera Alexa
function buildAlexaResponse(text: string, shouldEndSession: boolean, repromptText?: string) {
  const response: any = {
    outputSpeech: {
      type: "PlainText",
      text: text,
    },
    shouldEndSession,
  };

  if (!shouldEndSession) {
    response.reprompt = {
      outputSpeech: {
        type: "PlainText",
        text: repromptText || "¿En qué más puedo ayudarte?",
      },
    };
  }

  return {
    version: "1.0",
    response,
  };
}

// Función para obtener contexto del usuario desde Firestore
async function getUserContext(alexaUserId: string): Promise<UserContext> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('alexaUserId', '==', alexaUserId), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return {
        name: userData.displayName,
        city: userData.preferences?.city,
        interests: userData.preferences?.interests,
        userId: userData.uid
      };
    }
  } catch (error) {
    console.error("Error fetching user context:", error);
  }
  return {};
}

// Función para guardar interacción
async function saveInteraction(alexaUserId: string, queryText: string, responseText: string, model: string) {
  try {
    await addDoc(collection(db, 'interactions'), {
      alexaUserId,
      query: queryText,
      response: responseText,
      model: model,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving interaction:", error);
  }
}

// Función para llamar a Gemini con Grounding (Maps y Search)
async function callGeminiWithGrounding(prompt: string, context: UserContext, useMaps: boolean) {
  try {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    let systemInstruction = `Eres un asistente de voz útil y conciso llamado Super IA. Estás respondiendo a través de Alexa.
Hoy es ${dateStr} y son las ${timeStr}.`;

    if (context.name) systemInstruction += ` El usuario se llama ${context.name}.`;
    if (context.city) systemInstruction += ` El usuario vive en ${context.city}.`;
    
    systemInstruction += `\nUsa datos de Google Maps y Búsqueda de Google para dar información precisa. Tus respuestas deben ser cortas, claras y sin formato markdown.`;

    const tools: any[] = [{ googleSearch: {} }];
    if (useMaps) tools.push({ googleMaps: {} });

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        tools
      },
    });

    return response.text || "No pude encontrar información precisa.";
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error llamando a Gemini Grounding:", error);
    return "Tuve un problema al consultar internet. ¿Quieres preguntarme otra cosa?";
  }
}

// Función para llamar a la API de Groq con reintentos en modelos de respaldo
async function callGroq(prompt: string, context: UserContext) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return "La clave de API de Groq no está configurada en el servidor.";
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  let systemContent = `Eres un asistente de voz útil, conciso y directo. Estás respondiendo a través de un altavoz inteligente Alexa.
Hoy es ${dateStr} y son las ${timeStr}.`;

  if (context.name) systemContent += ` El usuario se llama ${context.name}.`;
  if (context.city) systemContent += ` El usuario vive en ${context.city}.`;
  
  systemContent += `\nTus respuestas deben ser cortas, claras, conversacionales y sin formato markdown. Usa un tono amigable.`;

  // Lista de modelos a intentar: el seleccionado primero, luego los de respaldo si no están ya incluidos
  const selectedModel = getSelectedModel();
  const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter(m => m !== selectedModel)];

  for (const model of modelsToTry) {
    try {
      console.log(`Intentando llamar a Groq con el modelo: ${model}`);
      
      // Alexa tiene un timeout de 8 segundos. Configuramos un timeout de 7 segundos para nosotros.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: systemContent,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return data.choices[0]?.message?.content || "No obtuve una respuesta clara de Groq.";
      }

      const errorText = await res.text();
      console.warn(`Error con el modelo ${model} (${res.status}): ${errorText}. Intentando el siguiente...`);
      
      // Si el error es 401 (No autorizado), no tiene sentido reintentar con otros modelos
      if (res.status === 401) {
        return "Error de autenticación con Groq. Verifica tu API Key.";
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`Timeout con el modelo ${model}`);
      } else {
        console.error(`Error de red con el modelo ${model}:`, error);
      }
    }
  }

  return "Lo siento, me tomó demasiado tiempo procesar tu pregunta o hubo un error técnico. Por favor, intenta con algo más corto.";
}
