from fastapi import APIRouter, HTTPException, UploadFile, File
from database import supabase
from models import DocumentResponse, DocumentCreate, SearchQuery, DocumentSearchResponse
from services.embedding import generate_embedding
from services.pdf import extract_text_from_pdf, chunk_text

router = APIRouter()

@router.get("/documents", response_model=list[DocumentResponse])
def get_documents():
    """
    Retrieves a list of all documents stored in the database.
    """
    try:
        response = supabase.table("documents").select("id, content, metadata").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents", response_model=DocumentResponse)
def create_document(doc: DocumentCreate):
    """
    Creates a new document entry in the database.
    """
    try:
        vector = generate_embedding(doc.content)

        row_data = {
            "content": doc.content,
            "metadata": doc.metadata,
            "embedding": vector
        }

        response = supabase.table("documents").insert(row_data).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=500, detail="Database insertion returned no data")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/documents/upload", response_model=list[DocumentResponse])
async def upload_document(file: UploadFile = File(...)):
    """
    Uploads a PDF file, extracts its text, chunks it, and indexes it with vector embeddings.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    try:
        content_bytes = await file.read()
        extracted_text = extract_text_from_pdf(content_bytes)
        
        if not extracted_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        # Chunk the text
        chunks = chunk_text(extracted_text)
        
        results = []
        for i, chunk in enumerate(chunks):
            vector = generate_embedding(chunk)
            
            row_data = {
                "content": chunk,
                "metadata": {
                    "filename": file.filename, 
                    "content_type": file.content_type,
                    "size_bytes": len(content_bytes),
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                },
                "embedding": vector
            }
            results.append(row_data)

        # Batch insert for efficiency
        response = supabase.table("documents").insert(results).execute()

        if response.data:
            return response.data
        else:
            raise HTTPException(status_code=500, detail="Database insertion failed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    
@router.post("/search", response_model=list[DocumentSearchResponse])
def search_documents(search_payload: SearchQuery):
    """
    Performs a semantic search against the document database.

    1. Generates a vector embedding for the input query string.
    2. Executes the 'match_documents' RPC on Supabase to find nearest neighbors.
    3. Returns documents ranked by cosine similarity.

    Args:
        search_payload (SearchQuery): Contains the query text and desired number of results (top_k).

    Returns:
        list[DocumentSearchResponse]: List of documents with their content, metadata, and similarity score.
    """
    try:
        query_vector = generate_embedding(search_payload.query)

        # Call the PostgreSQL RPC function 'match_documents'
        # Parameters must match the function signature defined in SQL
        response = supabase.rpc("match_documents", {
            "query_embedding": query_vector,
            "match_threshold": 0.0, # Filter out low-relevance matches
            "match_count": search_payload.top_k
        }).execute()

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))