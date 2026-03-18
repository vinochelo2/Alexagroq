import { NextResponse } from 'next/server';
import { FALLBACK_MODELS } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const { prompt, model: requestedModel } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "La variable GROQ_API_KEY no está configurada en el servidor." },
        { status: 400 }
      );
    }

    // Lista de modelos a intentar: el solicitado primero, luego los de respaldo
    const modelsToTry = requestedModel 
      ? [requestedModel, ...FALLBACK_MODELS.filter(m => m !== requestedModel)]
      : FALLBACK_MODELS;

    let lastError = "";

    for (const model of modelsToTry) {
      try {
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
                content: "Eres un asistente útil. Responde de manera concisa para esta prueba.",
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
          return NextResponse.json({ 
            response: data.choices[0].message.content,
            modelUsed: model 
          });
        }

        const errorText = await res.text();
        lastError = `Error con ${model} (${res.status}): ${errorText}`;
        console.warn(lastError);

        if (res.status === 401) break; // No reintentar si es error de API Key

      } catch (error: any) {
        lastError = `Error de red con ${model}: ${error.message}`;
        console.error(lastError);
      }
    }

    return NextResponse.json(
      { error: `No se pudo obtener respuesta de ningún modelo. Último error: ${lastError}` },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error en test-groq:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
