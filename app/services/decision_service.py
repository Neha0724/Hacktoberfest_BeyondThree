def make_decision(ml_result: dict, evidence: str) -> dict:
    top = ml_result.get("top_predictions", [])

    category = ml_result.get("predicted_category", "Unknown")
    confidence = float(top[0]["probability"]) if top else 0.0

    second_score = (
        float(top[1]["probability"])
        if len(top) > 1
        else 0.0
    )
    margin = confidence - second_score

    # These are review thresholds, not calibrated probabilities.
    needs_review = confidence < 0.60 or margin < 0.15

    if confidence < 0.20:
        reason = (
            "ML confidence is very low. Verify the transaction "
            "against the source invoice or accounting document."
        )
    elif needs_review:
        reason = (
            "ML confidence is low or competing categories are close. "
            "Human verification recommended."
        )
    else:
        reason = (
            "ML selected the highest-scoring category. "
            "Verify against source evidence before posting."
        )

    return {
        "predicted_category": category,
        "confidence": round(confidence, 4),
        "needs_review": needs_review,
        "reason": reason,
    }
