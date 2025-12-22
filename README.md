# Axiom

**Axiom** is a local RAG (Retrieval-Augmented Generation) system designed to ingest documents, generate vector embeddings locally, and allow semantic search.

## Architecture

* **Backend:** FastAPI (Python)
* **Database:** Supabase (Local Docker) + PostgreSQL + pgvector
* **AI Engine:** sentence-transformers (`all-MiniLM-L6-v2`) running on CPU
* **Frontend:** Next.js (Planned)

## Setup

### 1. Database (Supabase)
Run the local Supabase instance using Docker:
```bash
supabase start