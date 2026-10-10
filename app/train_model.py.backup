
from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "raw" / "Voucher_Classification_Test_Cases_v2.csv"
MODEL_PATH = ROOT / "models" / "voucher_classifier.joblib"
LABEL_COL = "Voucher Category"


def row_to_text(row, columns):
    parts = []

    for col in columns:
        if col == LABEL_COL:
            continue

        value = row.get(col)

        if pd.notna(value) and str(value).strip():
            parts.append(f"{col}: {str(value).strip()}")

    return " | ".join(parts)


def main():
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=[LABEL_COL]).copy()
    df[LABEL_COL] = df[LABEL_COL].astype(str).str.strip()

    df["text"] = df.apply(
        lambda row: row_to_text(row, df.columns), axis=1
    )
    df = df[df["text"].str.strip().ne("")].copy()

    print("Rows:", len(df))
    print("Categories:", df[LABEL_COL].nunique())
    print("\nLabel counts:")
    print(df[LABEL_COL].value_counts().to_string())

    model = Pipeline([
        ("features", FeatureUnion([
            ("word", TfidfVectorizer(
                analyzer="word",
                ngram_range=(1, 2),
                sublinear_tf=True,
                strip_accents="unicode",
            )),
            ("char", TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                sublinear_tf=True,
                strip_accents="unicode",
            )),
        ])),
        ("classifier", LogisticRegression(
            C=3.0,
            max_iter=5000,
            random_state=42,
        )),
    ])

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    predictions = cross_val_predict(
        model, df["text"], df[LABEL_COL], cv=cv
    )

    print("\n5-fold cross-validation accuracy:",
          round(accuracy_score(df[LABEL_COL], predictions), 4))

    print("\nClassification report:")
    print(classification_report(
        df[LABEL_COL], predictions, zero_division=0
    ))

    labels = sorted(df[LABEL_COL].unique())
    matrix = confusion_matrix(
        df[LABEL_COL], predictions, labels=labels
    )

    print("\nConfusion matrix (label order):")
    print(labels)
    print(matrix)

    # Train final model on all available records for API inference.
    model.fit(df["text"], df[LABEL_COL])

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)

    print("\nSaved model:", MODEL_PATH)


if __name__ == "__main__":
    main()
