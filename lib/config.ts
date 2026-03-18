// Simple in-memory store for the selected Groq model.
// Note: In a production environment with multiple instances,
// this should be replaced with a database (e.g., Redis, Firestore, Postgres).

const globalStore = globalThis as unknown as {
  __GROQ_MODEL: string | undefined;
};

export const FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b"
];

export function getSelectedModel(): string {
  return globalStore.__GROQ_MODEL || process.env.GROQ_MODEL || FALLBACK_MODELS[0];
}

export function setSelectedModel(model: string): void {
  globalStore.__GROQ_MODEL = model;
}
