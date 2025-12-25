from sentence_transformers import SentenceTransformer

# Global instance for the embedding model to ensure singleton pattern usage.
# This prevents reloading the heavy model on every request.
_embedding_model = None

def get_embedding_model() -> SentenceTransformer:
    """
    Retrieves the global instance of the SentenceTransformer model.
    
    Lazy-loads the 'all-MiniLM-L6-v2' model if it has not been initialized yet.
    
    Returns:
        SentenceTransformer: The loaded embedding model.
    """
    global _embedding_model
    if _embedding_model is None:
        # Load the model from local cache or download from Hugging Face if missing.
        # 'all-MiniLM-L6-v2' produces 384-dimensional vectors.
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    return _embedding_model

def generate_embedding(text: str) -> list[float]:
    """
    Generates a vector embedding for the provided text string.

    Args:
        text (str): The input text to be vectorized.

    Returns:
        list[float]: A 384-dimensional list of floating point numbers representing 
                     the semantic meaning of the text.
    """
    model = get_embedding_model()
    
    # encode() returns a numpy array; convert to standard list for JSON serialization.
    vector = model.encode(text).tolist()
    
    return vector