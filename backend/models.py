from pydantic import BaseModel
from typing import Optional

class DocumentCreate(BaseModel):
    """
    Schema for creating a new document.
    Represents the expected payload for document ingestion endpoints.
    """
    content: str
    metadata: Optional[dict] = {}


class DocumentResponse(BaseModel):
    """
    Schema for document retrieval responses.
    Defines the public data structure returned to API clients.
    """
    id: int
    content: str
    metadata: Optional[dict]

    class Config:
        # Allows Pydantic to read data from ORM objects or database dictionaries
        from_attributes = True

class SearchQuery(BaseModel):
    """
    Schema for incoming semantic search requests.
    """
    query: str
    top_k: int = 5

class DocumentSearchResponse(DocumentResponse):
    """
    Schema for search results. Extends the standard document response 
    to include the similarity score calculated by the vector database.
    """
    similarity: float