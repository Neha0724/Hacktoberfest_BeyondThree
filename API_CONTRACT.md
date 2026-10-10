# SmartLedger API Contract Specification

This document defines the strict REST API contract between the **SmartLedger Frontend** and the **FastAPI Backend**.

## Base URL & Protocols
- Development API Base: `http://localhost:8000/api`
- Production API Base: Configurable via `VITE_API_BASE_URL`
- Default Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (optional; only attached when `VITE_AUTH_ENABLED=true`)
  - **Important Note on Auth:** When `VITE_AUTH_ENABLED=false` (default), all backend endpoints (`/batches`, `/transactions`, `/review`, `/analytics`, `/settings`, `/exports`) **must work without an `Authorization` header**.

---

## 1. Authentication (`/auth`) — [Optional: Only needed when `VITE_AUTH_ENABLED=true`]

> **Note:** When `VITE_AUTH_ENABLED=false` (the default setting), the frontend bypasses authentication completely, does not render any login screen, and does not call any `/auth` endpoints. These endpoints are only invoked if `VITE_AUTH_ENABLED=true` is set.

### 1.1 Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "accountant@smartledger.ai",
    "password": "string"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr-101",
      "name": "Chetan Sharma",
      "email": "accountant@smartledger.ai",
      "role": "Senior Financial Auditor"
    }
  }
  ```
- **Error `401 Unauthorized`:**
  ```json
  {
    "detail": "Invalid credentials or account inactive"
  }
  ```

### 1.2 Get Current User
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "id": "usr-101",
    "name": "Chetan Sharma",
    "email": "accountant@smartledger.ai",
    "role": "Senior Financial Auditor"
  }
  ```

### 1.3 Logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Response `200 OK`:**
  ```json
  {
    "success": true
  }
  ```

---

## 2. Batches (`/batches`)

### 2.1 Upload Batch
- **Method:** `POST`
- **Path:** `/api/batches`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: Binary file (`.xlsx`, `.xls`, `.csv`)
  - `run_qwen_reasoning`: Boolean (`"true"` | `"false"`)
  - `auto_route_to_review`: Boolean (`"true"` | `"false"`)
- **Response `201 Created`:**
  ```json
  {
    "id": "batch-101",
    "filename": "FY26_Q2_North_Division_Transactions.xlsx",
    "uploaded_at": "2026-10-10T10:30:00Z",
    "total_rows": 150,
    "status": "processing",
    "auto_classified_count": 0,
    "auto_classified_pct": 0,
    "review_count": 0,
    "average_confidence": 0,
    "average_data_quality": "High",
    "run_qwen_reasoning": true,
    "auto_route_to_review": true,
    "current_stage_index": 0,
    "pipeline_stages": [
      { "id": "1", "name": "Validation & Cleaning", "status": "running" },
      { "id": "2", "name": "Evidence & Intent", "status": "pending" },
      { "id": "3", "name": "ML Prediction", "status": "pending" },
      { "id": "4", "name": "Qwen Reasoning", "status": "pending" },
      { "id": "5", "name": "Fusion & Conflict Check", "status": "pending" },
      { "id": "6", "name": "Routing", "status": "pending" }
    ]
  }
  ```

### 2.2 List Batches
- **Method:** `GET`
- **Path:** `/api/batches`
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "batch-101",
      "filename": "FY26_Q2_North_Division_Transactions.xlsx",
      "uploaded_at": "2026-10-10T10:30:00Z",
      "completed_at": "2026-10-10T10:32:15Z",
      "total_rows": 150,
      "status": "completed",
      "auto_classified_count": 106,
      "auto_classified_pct": 70.6,
      "review_count": 29,
      "average_confidence": 0.89,
      "average_data_quality": "High",
      "run_qwen_reasoning": true,
      "auto_route_to_review": true
    }
  ]
  ```

### 2.3 Get Batch Details
- **Method:** `GET`
- **Path:** `/api/batches/{batch_id}`
- **Response `200 OK`:**
  ```json
  {
    "id": "batch-101",
    "filename": "FY26_Q2_North_Division_Transactions.xlsx",
    "uploaded_at": "2026-10-10T10:30:00Z",
    "completed_at": "2026-10-10T10:32:15Z",
    "total_rows": 150,
    "status": "completed",
    "auto_classified_count": 106,
    "auto_classified_pct": 70.6,
    "review_count": 29,
    "average_confidence": 0.89,
    "average_data_quality": "High",
    "current_stage_index": 6,
    "voucher_distribution": {
      "Purchase": 54,
      "Sales": 41,
      "Payment": 21,
      "Receipt": 18,
      "Contra": 9
    }
  }
  ```

### 2.4 Poll Batch Status
- **Method:** `GET`
- **Path:** `/api/batches/{batch_id}/status`
- **Response `200 OK`:** Same structure as `GET /api/batches/{batch_id}`

---

## 3. Transactions (`/transactions`)

### 3.1 List Transactions
- **Method:** `GET`
- **Path:** `/api/transactions`
- **Query Parameters:**
  - `batch_id`: String (optional)
  - `status`: `"auto_classified"` | `"needs_review"` | `"conflict_resolved"` | `"reviewed_confirmed"` | `"reviewed_corrected"`
  - `confidence_level`: `"High"` | `"Medium"` | `"Low"`
  - `data_quality`: `"High"` | `"Medium"` | `"Low"`
  - `voucher_type`: Repeatable query param (e.g. `?voucher_type=Purchase&voucher_type=Sales`)
  - `search`: String
  - `sort_by`: String (e.g. `"amount"`, `"date"`, `"confidence"`)
  - `sort_order`: `"asc"` | `"desc"`
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 15)
- **Response `200 OK`:**
  ```json
  {
    "items": [
      {
        "id": "tx-001",
        "batch_id": "batch-101",
        "invoice_number": "INV-2026-1042",
        "date": "2026-10-09",
        "party": "Tata Steel BSL Limited",
        "amount": 125000.0,
        "voucher_type": "Purchase",
        "confidence": 0.94,
        "confidence_level": "High",
        "data_quality": "High",
        "status": "auto_classified"
      }
    ],
    "total": 300,
    "page": 1,
    "limit": 15,
    "totalPages": 20
  }
  ```

### 3.2 Get Transaction Detail (Explainability)
- **Method:** `GET`
- **Path:** `/api/transactions/{id}`
- **Response `200 OK`:**
  ```json
  {
    "id": "tx-001",
    "batch_id": "batch-101",
    "invoice_number": "INV-2026-1042",
    "date": "2026-10-09",
    "party": "Tata Steel BSL Limited",
    "amount": 125000.0,
    "voucher_type": "Purchase",
    "confidence": 0.94,
    "confidence_level": "High",
    "data_quality": "High",
    "data_quality_missing_fields": [],
    "status": "auto_classified",
    "raw_record": {
      "InvoiceNo": "INV-2026-1042",
      "Date": "2026-10-09",
      "PartyName": "Tata Steel BSL Limited",
      "GSTIN": "27AABCT3921F1Z1",
      "TaxableValue": 105932,
      "CGST": 9534,
      "SGST": 9534,
      "TotalAmount": 125000
    },
    "evidence": {
      "party_flow": "supplier_to_business",
      "money_flow": "business_to_supplier",
      "goods_flow": "supplier_to_business",
      "tax_evidence": "CGST 9% + SGST 9% (HSN 8471 Verified)",
      "other_signals": ["Valid GSTIN registered", "HSN code matched"]
    },
    "intent": "Acquisition of goods from a verified supplier",
    "evidence_matrix": [
      {
        "signal": "Supplier Invoice with GST",
        "purchase": "yes",
        "sales": "no",
        "payment": "no",
        "receipt": "no"
      }
    ],
    "ml_prediction": {
      "voucher": "Purchase",
      "probability": 0.94
    },
    "llm_prediction": {
      "voucher": "Purchase",
      "reasoning": "Derived intent is acquisition of merchandise from Tata Steel. Tax invoice and inbound delivery verify purchase voucher."
    },
    "agreement": true,
    "explanation": "High evidence consensus: ML and Qwen both determined Purchase with strong supplier verification.",
    "review_reasons": [],
    "audit_trail": [
      {
        "step": "Data Ingestion & Cleaning",
        "timestamp": "10:20:11 AM",
        "detail": "Schema parsed. Field datatypes validated.",
        "status": "passed"
      }
    ]
  }
  ```

---

## 4. Human Review Queue (`/review`)

### 4.1 Get Review Queue
- **Method:** `GET`
- **Path:** `/api/review/queue`
- **Query Parameters:**
  - `batch_id`: String (optional)
  - `reason`: String (optional)
  - `search`: String (optional)
- **Response `200 OK`:**
  Array of `Transaction` objects with `status === "needs_review"`, sorted by lowest confidence first.

### 4.2 Submit Review Decision
- **Method:** `POST`
- **Path:** `/api/review/{transaction_id}`
- **Request Body:**
  ```json
  {
    "action": "confirm | correct",
    "corrected_voucher": "Payment",
    "note": "Accountant note explaining the reason"
  }
  ```
- **Response `200 OK`:**
  Updated `Transaction` object with updated `status` (`"reviewed_confirmed"` or `"reviewed_corrected"`).

---

## 5. Analytics & Evaluation (`/analytics`)

### 5.1 Get Evaluation Metrics
- **Method:** `GET`
- **Path:** `/api/analytics`
- **Response `200 OK`:**
  ```json
  {
    "accuracy": 0.942,
    "precision": 0.938,
    "recall": 0.946,
    "macro_f1": 0.924,
    "per_category_f1": [
      { "category": "Purchase", "f1": 0.965, "count": 480 }
    ],
    "confusion_matrix": [
      { "actual": "Purchase", "predicted": "Payment", "count": 14 }
    ],
    "hard_negatives": [
      {
        "pair": "Purchase ↔ Payment",
        "error_count": 25,
        "error_rate": 0.031,
        "common_cause": "Bank statements mentioning supplier name without tax details"
      }
    ],
    "model_comparison": [
      { "model": "SmartLedger Pipeline", "macro_f1": 0.924, "accuracy": 0.942, "latency_ms": 24.5 }
    ],
    "calibration": {
      "bins": [
        { "confidence_bin": "0.8 - 1.0", "predicted_confidence": 0.94, "actual_accuracy": 0.95 }
      ],
      "ece": 0.018,
      "brier_score": 0.042
    },
    "inference_stats": {
      "avg_per_record_ms": 24.5,
      "ml_per_record_ms": 1.4,
      "llm_per_record_ms": 82.0,
      "fusion_per_record_ms": 2.1,
      "avg_batch_seconds": 4.2
    }
  }
  ```

---

## 6. Exports (`/exports`)

### 6.1 Download Export
- **Method:** `GET`
- **Path:** `/api/exports`
- **Query Parameters:**
  - `format`: `"xlsx"` | `"csv"` | `"json"`
  - `batch_id`: String (optional)
  - `token`: Bearer auth token
- **Response `200 OK`:**
  Binary stream with appropriate Content-Disposition header (e.g. `attachment; filename=smartledger_export.xlsx`).

---

## 7. System Settings (`/settings`)

### 7.1 Get Settings
- **Method:** `GET`
- **Path:** `/api/settings`
- **Response `200 OK`:**
  ```json
  {
    "auto_classify_threshold": 0.85,
    "model_name": "Qwen2.5-3B-Instruct (initial)",
    "default_export_format": "xlsx",
    "theme": "system",
    "enable_qwen_default": true,
    "auto_route_default": true
  }
  ```

### 7.2 Update Settings
- **Method:** `PUT`
- **Path:** `/api/settings`
- **Request Body:** Partial `SystemSettings` object
- **Response `200 OK`:** Updated `SystemSettings` object.
