// src/api.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface AskPayload { question: string }
export interface Source { article_id: string; content: string; type: string }
export interface AskResponse {
  answer: string;
  sources: Source[];
  language: "fr" | "ar";
  error?: string;
}

export async function ask(payload: AskPayload): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erreur serveur ${res.status}`);
  return res.json();
}
