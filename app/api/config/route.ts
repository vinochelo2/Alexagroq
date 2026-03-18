import { NextResponse } from 'next/server';
import { getSelectedModel, setSelectedModel } from '@/lib/config';

export async function GET() {
  return NextResponse.json({ model: getSelectedModel() });
}

export async function POST(req: Request) {
  try {
    const { model } = await req.json();
    if (model) {
      setSelectedModel(model);
      return NextResponse.json({ success: true, model: getSelectedModel() });
    }
    return NextResponse.json({ error: "Model is required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
