import { NextResponse } from 'next/server';
import { getSelectedModel, FALLBACK_MODELS } from '@/lib/config';

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
        buildAlexaResponse("Hola, soy tu asistente Groq. ¿Qué quieres saber?", false)
      );
    }

    // 2. Manejar las intenciones (cuando el usuario hace una pregunta)
    if (requestType === 'IntentRequest') {
      const intentName = body.request.intent.name;

      if (intentName === 'GroqIntent') {
        // Obtener la pregunta del usuario desde el slot "Query"
        const query =
          body.request.intent.slots?.Query?.value ||
          body.request.intent.slots?.query?.value;

        if (!query) {
          return NextResponse.json(
            buildAlexaResponse("No escuché bien tu pregunta. ¿Puedes repetirla?", false)
          );
        }

        // Llamar a la API de Groq
        const groqResponse = await callGroq(query);
        
        // Devolver la respuesta a Alexa
        return NextResponse.json(buildAlexaResponse(groqResponse, false));
      }

      // Intenciones por defecto de Amazon (Parar, Cancelar)
      if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        return NextResponse.json(buildAlexaResponse("Hasta luego.", true));
      }
      
      if (intentName === 'AMAZON.HelpIntent') {
        return NextResponse.json(buildAlexaResponse("Puedes preguntarme cualquier cosa. Por ejemplo, dime qué es la física cuántica.", false));
      }
    }

    // 3. Manejar cuando la sesión termina
    if (requestType === 'SessionEndedRequest') {
      return NextResponse.json({}, { status: 200 });
    }

    // Respuesta por defecto si no entendemos la solicitud
    return NextResponse.json(
      buildAlexaResponse("Lo siento, no entendí eso.", false)
    );
  } catch (error) {
    console.error("Error en el endpoint de Alexa:", error);
    return NextResponse.json(
      buildAlexaResponse("Hubo un error al procesar tu solicitud.", true)
    );
  }
}

// Función auxiliar para construir la respuesta en el formato que espera Alexa
function buildAlexaResponse(text: string, shouldEndSession: boolean) {
  return {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: text,
      },
      shouldEndSession,
    },
  };
}

// Función para llamar a la API de Groq con reintentos en modelos de respaldo
async function callGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return "La clave de API de Groq no está configurada en el servidor.";
  }

  // Lista de modelos a intentar: el seleccionado primero, luego los de respaldo si no están ya incluidos
  const selectedModel = getSelectedModel();
  const modelsToTry = [selectedModel, ...FALLBACK_MODELS.filter(m => m !== selectedModel)];

  for (const model of modelsToTry) {
    try {
      console.log(`Intentando llamar a Groq con el modelo: ${model}`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "Eres un asistente de voz útil, conciso y directo. Estás respondiendo a través de un altavoz inteligente Alexa, así que tus respuestas deben ser cortas, claras, conversacionales y sin formato markdown (sin asteriscos, sin negritas, sin viñetas). Usa un tono amigable.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }

      const errorText = await res.text();
      console.warn(`Error con el modelo ${model} (${res.status}): ${errorText}. Intentando el siguiente...`);
      
      // Si el error es 401 (No autorizado), no tiene sentido reintentar con otros modelos
      if (res.status === 401) {
        return "Error de autenticación con Groq. Verifica tu API Key.";
      }

    } catch (error) {
      console.error(`Error de red con el modelo ${model}:`, error);
    }
  }

  return "No pude obtener una respuesta de ninguno de los modelos de Groq. Por favor, inténtalo más tarde.";
}
