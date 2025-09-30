import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { GoogleGenAI } from "@google/genai";

export class GeminiEmbeddings1536 implements EmbeddingsInterface {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    const key = options?.apiKey || process.env.GOOGLE_API_KEY || "";
    if (!key) {
      throw new Error("GOOGLE_API_KEY is required for Gemini embeddings");
    }
    this.apiKey = key;
    this.model = options?.model || "gemini-embedding-001";
    console.log(`[GeminiEmbeddings1536] Initialized with model: ${this.model}`);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const results: number[][] = [];
    const MAX_BATCH = 50;
    for (let i = 0; i < texts.length; i += MAX_BATCH) {
      const slice = texts.slice(i, i + MAX_BATCH);
      const response: any = await ai.models.embedContent({
        model: this.model,
        contents: slice,
        outputDimensionality: 1536,
      } as any);
      if (Array.isArray(response?.embeddings)) {
        const first = response.embeddings[0];
        if (Array.isArray(first)) {
          results.push(...(response.embeddings as number[][]));
        } else {
          results.push(...(response.embeddings as Array<{ values: number[] }> ).map((e) => e.values));
        }
      } else if (response?.embedding?.values) {
        results.push(response.embedding.values);
      }
    }
    return results;
  }

  async embedQuery(text: string): Promise<number[]> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const response: any = await ai.models.embedContent({
      model: this.model,
      content: text,
      outputDimensionality: 1536,
    } as any);
    if (response?.embedding?.values) return response.embedding.values;
    if (Array.isArray(response?.embeddings)) {
      const first = response.embeddings[0];
      if (Array.isArray(first)) return first as number[];
      if (first?.values) return first.values as number[];
    }
    return [];
  }
}


