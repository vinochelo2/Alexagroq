import { NextResponse } from 'next/server';
import { getSelectedModel, setSelectedModel, FALLBACK_MODELS } from '@/lib/config';

export async function GET() {
  try {
    const selectedModel = getSelectedModel();
    const availableModels = FALLBACK_MODELS;
    return NextResponse.json({ 
      selectedModel,
      availableModels
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { model } = body;
    
    if (!FALLBACK_MODELS.includes(model)) {
      return NextResponse.json({ error: "Modelo no válido" }, { status: 400 });
    }
    
    setSelectedModel(model);
    
    return NextResponse.json({ 
      success: true, 
      selectedModel: getSelectedModel() 
    });
  } catch {
    return NextResponse.json({ error: "Error al actualizar el modelo" }, { status: 500 });
  }
}
