// Simple in-memory store for the selected Groq model.
// Note: In a production environment with multiple instances,
// this should be replaced with a database (e.g., Redis, Firestore, Postgres).

const globalStore = globalThis as unknown as {
  __GROQ_MODEL: string | undefined;
};

export function getSelectedModel(): string {
  return globalStore.__GROQ_MODEL || process.env.GROQ_MODEL || "llama3-8b-8192";
}

export function setSelectedModel(model: string): void {
  globalStore.__GROQ_MODEL = model;
}
