from pydantic import BaseModel, Field
from typing import Any

class TransactionRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=10000)
    fields: dict[str, Any] = Field(default_factory=dict)

class PredictionResponse(BaseModel):
    input: str
    evidence: str
    ml: dict
    predicted_category: str
    confidence: float
    needs_review: bool
    reason: str
