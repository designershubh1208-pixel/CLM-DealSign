import fitz  # PyMuPDF
import docx
from fastapi import UploadFile, HTTPException
from app.utils.text_processing import clean_text

async def parse_document(file: UploadFile) -> str:
    """Parses text from PDF or DOCX file."""
    content = await file.read()
    filename = file.filename.lower() if file.filename else ""
    text = ""

    try:
        if filename.endswith(".pdf"):
            text = _parse_pdf(content)
        elif filename.endswith(".docx"):
            text = _parse_docx(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF or DOCX.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")

    return clean_text(text)

def _parse_pdf(content: bytes) -> str:
    """Extracts text from PDF bytes."""
    with fitz.open(stream=content, filetype="pdf") as doc:
        text = ""
        for page in doc:
            text += page.get_text()
    return text

def _parse_docx(content: bytes) -> str:
    """Extracts text from DOCX bytes."""
    # python-docx requires a file-like object
    from io import BytesIO
    file_stream = BytesIO(content)
    doc = docx.Document(file_stream)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text
