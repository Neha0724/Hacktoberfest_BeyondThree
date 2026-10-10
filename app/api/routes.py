from fastapi import APIRouter, HTTPException

from app.schemas.transaction import TransactionRequest
from app.services.evidence_service import extract_evidence
from app.services.ml_service import predict_voucher
from app.services.decision_service import make_decision
from app.services.llm_service import classify_with_llm

router = APIRouter()


def classify_evidence(evidence: str) -> dict:
    ml_result = predict_voucher(evidence)
    decision = make_decision(ml_result, evidence)

    try:
        llm_result = classify_with_llm(evidence)

        ml_result["llm"] = llm_result

        ml_category = ml_result.get("predicted_category", "")
        llm_category = llm_result.get("predicted_category", "")

        if decision.get("confidence", 0) < 0.20 and llm_category:
            decision["predicted_category"] = llm_category
            decision["needs_review"] = True
            decision["reason"] = (
                "ML confidence is very low. "
                "LLM suggestion displayed; human verification required."
            )

        elif llm_category and ml_category != llm_category:
            decision["needs_review"] = True
            decision["reason"] = (
                "ML and LLM predictions disagree; human review required."
            )

        elif llm_result.get("needs_review", True):
            decision["needs_review"] = True
            decision["reason"] = "LLM recommends additional review."

    except Exception as exc:
        ml_result["llm"] = {
            "status": "unavailable",
            "reason": f"LLM request failed: {type(exc).__name__}: {exc}",
        }

    return {
        "ml": ml_result,
        **decision,
    }


@router.post("/predict")
def predict(payload: TransactionRequest):
    try:
        evidence = extract_evidence(
            payload.description,
            payload.fields,
        )

        result = classify_evidence(evidence)
        ml_result = result.get("ml", {})

        return {
            "input": payload.description,
            "evidence": evidence,
            "ml": ml_result,
            "llm": ml_result.get(
                "llm",
                {
                    "status": "unavailable",
                    "reason": "LLM result was not returned.",
                },
            ),
            "predicted_category": result.get(
                "predicted_category",
                ml_result.get("predicted_category", "Unknown"),
            ),
            "confidence": result.get("confidence", 0.0),
            "needs_review": result.get("needs_review", True),
            "reason": result.get("reason", ""),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Voucher classification failed: {type(exc).__name__}: {exc}",
        ) from exc