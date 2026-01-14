from typing import List, Tuple
from app.models.schemas import RiskResponse, ClauseResponse

RISK_PATTERNS = [
    {
        "pattern": "unlimited liability",
        "severity": "CRITICAL",
        "description": "Unlimited liability exposure detected.",
        "recommendation": "Cap liability at contract value or fixed amount."
    },
    {
        "pattern": "terminate without notice",
        "severity": "HIGH",
        "description": "Right to terminate without prior notice.",
        "recommendation": "Require at least 30 days prior written notice."
    },
    {
        "pattern": "sole discretion",
        "severity": "MEDIUM",
        "description": "One-sided discretion favoring the other party.",
        "recommendation": "Change to 'reasonable discretion' or mutual consent."
    },
    {
        "pattern": "auto-renew",
        "severity": "MEDIUM",
        "description": "Automatic renewal clause detected.",
        "recommendation": "Ensure opt-out window is tracked."
    },
    {
        "pattern": "waive jury trial",
        "severity": "HIGH",
        "description": "Waiver of right to jury trial.",
        "recommendation": "Review legal implications restricted rights."
    }
]

RISK_SCORES = {
    "CRITICAL": 40,
    "HIGH": 25,
    "MEDIUM": 15,
    "LOW": 5
}

def detect_risks(text: str, clauses: List[ClauseResponse]) -> Tuple[List[RiskResponse], int]:
    """Detects risks based on patterns and calculates risk score."""
    risks = []
    total_score = 0
    lower_text = text.lower()
    
    for pattern in RISK_PATTERNS:
        if pattern["pattern"] in lower_text:
            risks.append(RiskResponse(
                severity=pattern["severity"],
                description=pattern["description"],
                recommendation=pattern["recommendation"],
                clauseReference="General" # Ideally find specific clause
            ))
            total_score += RISK_SCORES.get(pattern["severity"], 0)
            
    # Normalize score 0-100
    risk_score = min(total_score, 100)
    
    return risks, risk_score
