// Simple in-memory store for the selected Groq model.
export const FALLBACK_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768"
];

const globalStore = globalThis as unknown as {
  __GROQ_MODEL: string | undefined;
};

export function getSelectedModel(): string {
  return globalStore.__GROQ_MODEL || process.env.GROQ_MODEL || FALLBACK_MODELS[0];
}

export function setSelectedModel(model: string): void {
  globalStore.__GROQ_MODEL = model;
}
