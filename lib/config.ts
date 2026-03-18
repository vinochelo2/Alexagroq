// Simple in-memory store for the selected Groq model.
// Note: In a production environment with multiple instances,
// this should be replaced with a database (e.g., Redis, Firestore, Postgres).

const globalStore = globalThis as unknown as {
  __GROQ_MODEL: string | undefined;
};

export const FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768"
];

export function getSelectedModel(): string {
  // Priority: 1. Runtime selection (globalStore), 2. Environment variable, 3. Default fallback
  return globalStore.__GROQ_MODEL || process.env.GROQ_MODEL || FALLBACK_MODELS[0];
}

export function setSelectedModel(model: string): void {
  globalStore.__GROQ_MODEL = model;
}
