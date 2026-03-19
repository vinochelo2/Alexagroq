import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 401 });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Models fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
  }
}
