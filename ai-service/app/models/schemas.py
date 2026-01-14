from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    text: str
    contract_id: str

class ClauseResponse(BaseModel):
    type: str
    text: str
    section: str
    riskLevel: str  # LOW, MEDIUM, HIGH

class RiskResponse(BaseModel):
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    recommendation: str
    clauseReference: Optional[str] = None

class AnalyzeResponse(BaseModel):
    summary: str
    risk_score: int
    clauses: List[ClauseResponse]
    risks: List[RiskResponse]

class QARequest(BaseModel):
    text: str
    question: str

class QAResponse(BaseModel):
    answer: str
    confidence: float

class SummarizeRequest(BaseModel):
    text: str

class SummarizeResponse(BaseModel):
    summary: str

class ClauseRequest(BaseModel):
    text: str

class ClauseListResponse(BaseModel):
    clauses: List[ClauseResponse]

class RiskRequest(BaseModel):
    text: str
    clauses: List[ClauseResponse]

class RiskListResponse(BaseModel):
    risks: List[RiskResponse]
    risk_score: int
