def make_decision(ml_result: dict, evidence: str) -> dict:
    top = ml_result.get("top_predictions", [])

    category = ml_result.get("predicted_category", "Unknown")
    confidence = (
        float(top[0]["probability"])
        if top
        else 0.0
    )

    second_score = (
        float(top[1]["probability"])
        if len(top) > 1
        else 0.0
    )

    margin = confidence - second_score

    # Conservative review policy: do not auto-approve
    # low-confidence or closely competing predictions.
    low_confidence = confidence < 0.60
    close_competitors = margin < 0.15

    needs_review = low_confidence or close_competitors

    if not top:
        reason = (
            "No ML prediction scores were returned. "
            "Manual verification is required."
        )
        needs_review = True

    elif confidence < 0.20:
        reason = (
            f"ML confidence is very low ({confidence:.1%}). "
            "Verify the transaction against its source document."
        )

    elif low_confidence and close_competitors:
        reason = (
            f"ML confidence is low ({confidence:.1%}) and "
            f"the top-two score margin is {margin:.1%}. "
            "Human verification is required."
        )

    elif low_confidence:
        reason = (
            f"ML confidence is low ({confidence:.1%}). "
            "Human verification is recommended."
        )

    elif close_competitors:
        reason = (
            f"Top categories are close (score margin {margin:.1%}). "
            "Human verification is recommended."
        )

    else:
        reason = (
            "ML selected the highest-scoring category. "
            "Verify the classification before posting."
        )

    return {
        "predicted_category": category,
        "confidence": round(confidence, 4),
        "needs_review": needs_review,
        "reason": reason,
    }