
from typing import Any


FIELD_ALIASES = {
    "amount": "Total Amount",
    "party_name": "Party Name",
    "transaction_type": "Transaction Type",
}


def extract_evidence(
    description: str,
    fields: dict[str, Any] | None = None,
) -> str:
    parts = []
    description = (description or "").strip()

    if description:
        parts.append(f"Transaction Description: {description}")

    for key, value in (fields or {}).items():
        if value is None or not str(value).strip():
            continue

        column_name = FIELD_ALIASES.get(key, key.replace("_", " ").title())
        parts.append(f"{column_name}: {value}")

    evidence = " | ".join(parts).strip()

    if not evidence:
        raise ValueError("Provide a transaction description or fields.")

    return evidence
