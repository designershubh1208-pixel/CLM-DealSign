from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from app.config import settings
from app.models.schemas import (
    AnalyzeRequest, AnalyzeResponse,
    QARequest, QAResponse,
    SummarizeRequest, SummarizeResponse,
    ClauseRequest, ClauseListResponse,
    RiskRequest, RiskListResponse
)
from app.services import (
    document_parser,
    summarizer,
    clause_extractor,
    risk_detector,
    qa_engine
)

app = FastAPI(title="DealSign AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_document(request: AnalyzeRequest):
    try:
        # Full analysis pipeline
        summary = summarizer.summarize_text(request.text)
        clauses = clause_extractor.extract_clauses(request.text)
        risks, score = risk_detector.detect_risks(request.text, clauses)
        
        return AnalyzeResponse(
            summary=summary,
            risk_score=score,
            clauses=clauses,
            risks=risks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/parse-document")
async def parse_document_endpoint(file: UploadFile = File(...)):
    text = await document_parser.parse_document(file)
    return {"text": text, "filename": file.filename}

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(request: SummarizeRequest):
    summary = summarizer.summarize_text(request.text)
    return {"summary": summary}

@app.post("/extract-clauses", response_model=ClauseListResponse)
async def extract_clauses_endpoint(request: ClauseRequest):
    clauses = clause_extractor.extract_clauses(request.text)
    return {"clauses": clauses}

@app.post("/detect-risks", response_model=RiskListResponse)
async def detect_risks_endpoint(request: RiskRequest):
    risks, score = risk_detector.detect_risks(request.text, request.clauses)
    return {"risks": risks, "risk_score": score}

@app.post("/ask", response_model=QAResponse)
async def ask_endpoint(request: QARequest):
    result = qa_engine.answer_question(request.text, request.question)
    return result

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
