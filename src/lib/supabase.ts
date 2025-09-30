import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GeminiEmbeddings1536 } from "./geminiEmbeddings";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.",
  );
}

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    "Please set GOOGLE_API_KEY environment variable.",
  );
}

const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Function to get a vector store instance from an existing index
export async function getVectorStore() {
  return new SupabaseVectorStore(
    // Use custom 1536-dimension Gemini embeddings to stay within common pgvector index limits
    new GeminiEmbeddings1536({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-embedding-001",
    }),
    {
      client,
      tableName: 'documents',
      queryName: 'match_documents',
      filter: {},
    }
  );
}

// Function to get a reference to the embeddings collection
export async function getEmbeddingsCollection() {
  return client.from('documents');
}
