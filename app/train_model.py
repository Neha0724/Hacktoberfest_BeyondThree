from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)

ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = ROOT / "data" / "raw" / "Voucher_Classification_Test_Cases_v2.csv"
MODEL_PATH = ROOT / "models" / "voucher_classifier.joblib"

LABEL_COL = "Voucher Category"


def row_to_text(row):
    parts = []

    for column, value in row.items():
        if column == LABEL_COL or pd.isna(value):
            continue

        value = str(value).strip()

        if value:
            parts.append(f"{column}: {value}")

    return " | ".join(parts)


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    if LABEL_COL not in df.columns:
        raise ValueError(f"Missing target column: {LABEL_COL}")

    df = df.dropna(subset=[LABEL_COL]).copy()
    df[LABEL_COL] = df[LABEL_COL].astype(str).str.strip()

    df = df[df[LABEL_COL].ne("")].copy()
    df["text"] = df.drop(columns=["text"], errors="ignore").apply(
        row_to_text, axis=1
    )

    df = df[df["text"].str.strip().ne("")].copy()

    counts = df[LABEL_COL].value_counts()

    if counts.min() < 5:
        raise ValueError(
            "Every category needs at least 5 examples for 5-fold CV."
        )

    print(f"Rows: {len(df)}")
    print(f"Categories: {df[LABEL_COL].nunique()}")
    print(f"Features in raw dataset: {len(df.columns) - 2}")
    print("\nCategory counts:")
    print(counts.sort_index().to_string())

    model = Pipeline([
        (
            "features",
            FeatureUnion([
                (
                    "word",
                    TfidfVectorizer(
                        analyzer="word",
                        ngram_range=(1, 2),
                        sublinear_tf=True,
                        strip_accents="unicode",
                        min_df=1,
                    ),
                ),
                (
                    "char",
                    TfidfVectorizer(
                        analyzer="char_wb",
                        ngram_range=(3, 5),
                        sublinear_tf=True,
                        strip_accents="unicode",
                        min_df=1,
                    ),
                ),
            ]),
        ),
        (
            "classifier",
            LogisticRegression(
                C=1.0,
                max_iter=5000,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ])

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    predictions = cross_val_predict(
        model,
        df["text"],
        df[LABEL_COL],
        cv=cv,
    )

    accuracy = accuracy_score(df[LABEL_COL], predictions)

    print(f"\n5-fold CV accuracy: {accuracy:.4f}")
    print("\nClassification report:")
    print(
        classification_report(
            df[LABEL_COL],
            predictions,
            zero_division=0,
        )
    )

    labels = sorted(df[LABEL_COL].unique())

    confusion = pd.DataFrame(
        confusion_matrix(
            df[LABEL_COL],
            predictions,
            labels=labels,
        ),
        index=labels,
        columns=labels,
    )

    print("\nConfusion matrix:")
    print(confusion.to_string())

    model.fit(df["text"], df[LABEL_COL])

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print(f"\nModel saved: {MODEL_PATH}")
    print("Pipeline interface preserved: predict_proba()")
    print("Classifier step preserved: model.named_steps['classifier']")


if __name__ == "__main__":
    main()