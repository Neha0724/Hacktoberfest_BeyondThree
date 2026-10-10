from fastapi import APIRouter, HTTPException

from app.schemas.transaction import TransactionRequest
from app.services.evidence_service import extract_evidence
from app.services.ml_service import predict_voucher
from app.services.decision_service import make_decision
from app.services.llm_service import classify_with_llm

router = APIRouter()


def classify_evidence(evidence: str) -> dict:
    # Step 1: ML prediction
    ml_result = predict_voucher(evidence)
    decision = make_decision(ml_result, evidence)

    ml_category = ml_result.get("predicted_category", "Unknown")
    confidence = float(decision.get("confidence", 0.0))

    # Step 2: LLM prediction
    try:
        llm_result = classify_with_llm(evidence)
    except Exception as exc:
        llm_result = {
            "status": "unavailable",
            "predicted_category": None,
            "reasoning": "",
            "needs_review": True,
            "reason": (
                f"LLM request failed: "
                f"{type(exc).__name__}: {exc}"
            ),
        }

    llm_category = (
        llm_result.get("predicted_category")
        if llm_result.get("status") == "success"
        else None
    )

    # Step 3: Preserve both model outputs
    if llm_category:
        llm_result["predicted_category"] = llm_category

    needs_review = bool(decision.get("needs_review", True))
    reason = decision.get("reason", "")
    final_category = ml_category

    # Step 4: Select the final suggestion
    if not llm_category:
        final_category = ml_category
        needs_review = True
        reason = (
            "LLM classification is unavailable. "
            "The ML prediction is shown as a fallback. "
            "Human verification is required."
        )

    elif ml_category != llm_category:
        # Prefer the LLM suggestion when the models disagree,
        # but explicitly require human verification.
        final_category = llm_category
        needs_review = True
        reason = (
            f"ML predicted '{ml_category}', while LLM predicted "
            f"'{llm_category}'. The LLM suggestion is displayed, "
            "but human verification is required."
        )

    else:
        # Both models agree.
        final_category = ml_category

        if needs_review or llm_result.get("needs_review", True):
            needs_review = True
            reason = (
                "ML and LLM agree on the category, but confidence "
                "or review checks indicate that verification is needed."
            )
        else:
            needs_review = False
            reason = (
                "ML and LLM agree on the suggested category. "
                "Verify the result against the transaction evidence."
            )

    # Step 5: Return a consistent result
    return {
        "ml_result": ml_result,
        "llm_result": llm_result,
        "ml_category": ml_category,
        "llm_category": llm_category,
        "predicted_category": final_category,
        "confidence": confidence,
        "needs_review": needs_review,
        "reason": reason,
    }


@router.post("/predict")
def predict(payload: TransactionRequest):
    try:
        # Step 1: Build transaction evidence
        evidence = extract_evidence(
            payload.description,
            payload.fields,
        )

        # Step 2: Classify transaction
        result = classify_evidence(evidence)

        ml_result = result["ml_result"]
        llm_result = result["llm_result"]

        # Step 3: Return the API response
        return {
            "input": payload.description,
            "evidence": evidence,
            "ml": {
                "predicted_category": result["ml_category"],
                "top_predictions": ml_result.get(
                    "top_predictions", []
                ),
                "model": ml_result.get(
                    "model",
                    "Word + Character TF-IDF + Logistic Regression",
                ),
            },
            "llm": llm_result,
            "ml_category": result["ml_category"],
            "llm_category": result["llm_category"],
            "predicted_category": result["predicted_category"],
            "confidence": result["confidence"],
            "needs_review": result["needs_review"],
            "reason": result["reason"],
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Voucher classification failed: "
                f"{type(exc).__name__}: {exc}"
            ),
        ) from exc