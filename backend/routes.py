from fastapi import APIRouter, HTTPException
from database import supabase
from models import DocumentResponse, DocumentCreate

router = APIRouter()

@router.get("/documents", response_model=list[DocumentResponse])
def get_documents():
    """
    Retrieves all documents from the database.
    Selects only metadata and content fields, excluding heavy vector embeddings.
    """
    try:
        response = supabase.table("documents").select("id, content, metadata").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents", response_model=DocumentResponse)
def create_document(doc: DocumentCreate):
    """
    Creates a new document record.
    Currently inserts a placeholder zero-vector for the embedding field.
    """
    try:
        row_data = {
            "content": doc.content,
            "metadata": doc.metadata,
            "embedding": [0.0] * 384 
        }

        response = supabase.table("documents").insert(row_data).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to insert document")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))