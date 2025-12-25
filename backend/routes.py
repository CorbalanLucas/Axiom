from fastapi import APIRouter, HTTPException, UploadFile, File
from database import supabase
from models import DocumentResponse, DocumentCreate
from services.embedding import generate_embedding
from services.pdf import extract_text_from_pdf

router = APIRouter()

@router.get("/documents", response_model=list[DocumentResponse])
def get_documents():
    """
    Retrieves a list of all documents stored in the database.

    Returns:
        list[DocumentResponse]: A list of documents containing id, content, and metadata.
                                Embedding vectors are excluded from the response for performance.
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
    
    Processes the input text to generate a vector embedding before storage.

    Args:
        doc (DocumentCreate): The document payload containing content and metadata.

    Returns:
        DocumentResponse: The created document record (id, content, metadata).
    """
    try:
        # Generate 384-dimensional vector for the content
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
    
@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Uploads a PDF file, extracts its text, and indexes it with vector embeddings.

    Args:
        file (UploadFile): A PDF file uploaded via multipart/form-data.

    Returns:
        DocumentResponse: The created document record.

    Raises:
        HTTPException: 400 if the file is not a PDF or contains no text.
                       500 if an error occurs during processing or database insertion.
    """
    # strict validation of MIME type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is allowed.")

    try:
        # Read file content asynchronously into memory
        content_bytes = await file.read()
        
        # Extract text using the PDF service
        extracted_text = extract_text_from_pdf(content_bytes)
        
        if not extracted_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from PDF. The file might be scanned (image-only) or empty.")

        # Generate vector embedding for the extracted text
        vector = generate_embedding(extracted_text)

        # Construct the database payload
        row_data = {
            "content": extracted_text,
            "metadata": {
                "filename": file.filename, 
                "content_type": file.content_type,
                "size_bytes": len(content_bytes)
            },
            "embedding": vector
        }
        
        response = supabase.table("documents").insert(row_data).execute()

        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=500, detail="Database insertion failed")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")