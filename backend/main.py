from fastapi import FastAPI
from routes import router as document_router

app = FastAPI(title="Axiom RAG API")

# Register routers
# The prefix "/api" ensures all document endpoints are accessible under http://domain/api/documents
app.include_router(document_router, prefix="/api")

@app.get("/")
def read_root():
    """
    Health check endpoint.
    Verifies that the API server is running and accessible.
    """
    return {"status": "online", "service": "Axiom Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

