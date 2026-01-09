/**
 * API Client Configuration
 * * Defines the base connection parameters for the backend service.
 * In a production environment, 'API_BASE_URL' should be sourced 
 * from environment variables (e.g., process.env.NEXT_PUBLIC_API_URL).
 */
const API_BASE_URL = "http://127.0.0.1:8000/api";

// --- Type Definitions ---

/**
 * Represents metadata associated with an indexed document.
 * Flexible structure to accommodate varying metadata fields from the backend.
 */
export interface DocumentMetadata {
  filename?: string;
  content_type?: string;
  size_bytes?: number;
  [key: string]: unknown;
}

/**
 * Represents the standard document structure returned by the API.
 */
export interface Document {
  id: number;
  content: string;
  metadata: DocumentMetadata;
}

/**
 * Extends the Document interface to include vector similarity scores.
 * Used specifically for search operation results.
 */
export interface SearchResult extends Document {
  similarity: number;
}

// --- API Methods ---

/**
 * Uploads a file to the backend for processing and indexing.
 * * Sends a multipart/form-data POST request to the '/documents/upload' endpoint.
 * The backend extracts text, generates embeddings, and stores the result.
 * * @param file - The standard JavaScript File object obtained from a file input.
 * @returns {Promise<Document>} The created document record from the database.
 * @throws {Error} If the HTTP response status is not 2xx.
 */
export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Executes a semantic search query against the vectorized document store.
 * * Sends a JSON POST request to the '/search' endpoint. The backend performs
 * cosine similarity comparison between the query vector and stored document vectors.
 * * @param query - The natural language query string.
 * @param topK - The number of results to retrieve (default: 5).
 * @returns {Promise<SearchResult[]>} An array of documents sorted by relevance score.
 * @throws {Error} If the HTTP response status is not 2xx.
 */
export async function searchDocuments(query: string, topK: number = 5): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      top_k: topK,
    }),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Retrieves a list of all indexed documents from the database.
 * * Sends a GET request to the '/documents' endpoint.
 * Intended for populating management views or file lists.
 * * @returns {Promise<Document[]>} An array of all document records.
 * @throws {Error} If the HTTP response status is not 2xx.
 */
export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.status}`);
  }

  return response.json();
}