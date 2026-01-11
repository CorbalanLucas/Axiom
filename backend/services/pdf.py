from io import BytesIO
from pypdf import PdfReader

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Parses a PDF file provided as raw bytes and extracts all available text.

    Args:
        file_content (bytes): The raw binary content of the PDF file.

    Returns:
        str: A single string containing the concatenated text of all pages, 
             separated by newlines. Returns an empty string if no text 
             could be extracted.
    
    Raises:
        Exception: Propagates pypdf exceptions if the file is malformed or encrypted.
    """
    stream = BytesIO(file_content)
    reader = PdfReader(stream)
    
    full_text = []
    
    for page in reader.pages:
        # extract_text() returns the text content or None if the page is empty/image-only
        text = page.extract_text()
        if text:
            full_text.append(text)
            
    return "\n".join(full_text)

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """
    Splits a large string into smaller chunks with a specified overlap.
    
    Args:
        text (str): The input text to be chunked.
        chunk_size (int): Maximum number of characters per chunk.
        overlap (int): Number of overlapping characters between adjacent chunks.
        
    Returns:
        list[str]: A list of text chunks.
    """
    if not text:
        return []
        
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        
        # Move the start pointer forward, accounting for overlap
        start += (chunk_size - overlap)
        
        # Safeguard against infinite loops if overlap >= chunk_size
        if chunk_size <= overlap:
            break
            
    return chunks