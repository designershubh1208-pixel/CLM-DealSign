import spacy
from typing import List
from app.models.schemas import ClauseResponse
from app.utils.text_processing import extract_section_number

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Warning: Model not found. Will need to download.
    nlp = spacy.blank("en") 

CLAUSE_KEYWORDS = {
    "PAYMENT": ["payment", "invoice", "fee", "net 30", "compensation", "remuneration"],
    "TERMINATION": ["termination", "terminate", "cancellation", "notice period", "breach"],
    "LIABILITY": ["liability", "indemnify", "damages", "limitation", "hold harmless"],
    "CONFIDENTIALITY": ["confidential", "non-disclosure", "proprietary", "trade secret"],
    "IP_RIGHTS": ["intellectual property", "copyright", "patent", "ownership", "work for hire"]
}

def extract_clauses(text: str) -> List[ClauseResponse]:
    """Extracts clauses based on keyword matching logic."""
    doc = nlp(text)
    clauses = []
    
    # Process text by paragraphs or sentences
    # For simplicity, we split by double newlines to approximate paragraphs/stats
    paragraphs = text.split('\n\n')
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        found_type = None
        lower_para = para.lower()
        
        # Determine type
        for c_type, keywords in CLAUSE_KEYWORDS.items():
            if any(kw in lower_para for kw in keywords):
                found_type = c_type
                break
        
        if found_type:
            section = extract_section_number(para)
            # Default risk assignment for now
            risk = "MEDIUM" if found_type == "LIABILITY" else "LOW"
            
            clauses.append(ClauseResponse(
                type=found_type,
                text=para[:200] + "..." if len(para) > 200 else para, # Truncate for display
                section=section,
                riskLevel=risk
            ))
            
    return clauses
