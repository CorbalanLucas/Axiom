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