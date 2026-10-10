
from pathlib import Path

import joblib

MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "voucher_classifier.joblib"
)

_model = None


def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. "
                "Run: python -m app.train_model"
            )

        _model = joblib.load(MODEL_PATH)

    return _model


def predict_voucher(text: str, top_k: int = 3) -> dict:
    text = (text or "").strip()

    if not text:
        raise ValueError("Transaction evidence cannot be empty.")

    model = get_model()

    probabilities = model.predict_proba([text])[0]
    classifier = model.named_steps["classifier"]
    labels = classifier.classes_

    ranked = sorted(
        zip(labels, probabilities),
        key=lambda item: item[1],
        reverse=True,
    )[:top_k]

    return {
        "predicted_category": str(ranked[0][0]),
        "top_predictions": [
            {
                "category": str(label),
                "probability": round(float(score), 4),
            }
            for label, score in ranked
        ],
        "model": "Word + Character TF-IDF + Logistic Regression",
    }
