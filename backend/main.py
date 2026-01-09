from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router as document_router

app = FastAPI(title="Axiom RAG API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

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

