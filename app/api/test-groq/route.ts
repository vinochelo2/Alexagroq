import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 401 });
  }

  try {
    const { prompt, model } = await req.json();
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt || "Hola" }]
      })
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Groq test error:", error);
    return NextResponse.json({ error: "Failed to test Groq" }, { status: 500 });
  }
}
