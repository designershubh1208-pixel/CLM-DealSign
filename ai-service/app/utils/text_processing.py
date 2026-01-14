import re

def clean_text(text: str) -> str:
    """Removes extra whitespace and normalizes text."""
    # Replace multiple newlines with single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_section_number(text: str) -> str:
    """Extracts section number if present (e.g., '1.1', '2.', 'Article I')."""
    match = re.search(r'^(\d+(\.\d+)*|\d+\.|Article\s+[IVX]+)', text.strip())
    if match:
        return match.group(0)
    return ""
