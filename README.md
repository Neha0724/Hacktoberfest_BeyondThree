# SmartLedger API

## Important dataset note
The provided CSV contains 120 labelled rows, 169 columns and 24 voucher categories (5 examples per category). This is a small test-case dataset, not enough evidence for a reliable production accuracy claim. Validate with more independently labelled transactions.

## Setup (Windows CMD)
```bat
cd D:\Hacktoberfest_BeyondThree
.venv\Scripts\activate
pip install -r requirements.txt
```

Copy the uploaded CSV to:
`data/raw/Voucher_Classification_Test_Cases_v2.csv`

Train the model:
```bat
python -m app.train_model
```

Run API:
```bat
python -m uvicorn app.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/docs`.

## Test prediction
In Swagger, use POST `/api/predict`:
```json
{
  "description": "Payment ID PMT-962668; payer Retail Networks Inc; payee Digital Solutions Corp; amount 50596.27; payment type Check/Cheque; against invoice SAL-803208"
}
```

Or CMD:
```bat
curl.exe -X POST http://127.0.0.1:8000/api/predict -H "Content-Type: application/json" -d "{\"description\":\"Payment ID PMT-962668; payer Retail Networks Inc; payee Digital Solutions Corp; amount 50596.27; payment type Check/Cheque; against invoice SAL-803208\"}"
```

## Docker
Build and run from the project root:
```powershell
docker build -t smartledger-api .
docker run --rm -p 8001:8000 smartledger-api
```
The model file `models/voucher_classifier.joblib` must exist before building. The current API endpoint uses the ML service. The Qwen service is provided but is not yet fused into the `/predict` decision.

## API endpoints
- `GET /` - basic service information
- `GET /api/health` - health check
- `POST /api/predict` - ML prediction and review decision

## Caveats
- The uploaded CSV is highly sparse and contains several different document-field groups side by side. Each row is trained as one example according to its `Voucher Category`; inspect the source rows for mixed/overlapping records before claiming quality.
- Current `confidence` is the model's top probability, not calibrated confidence.
- The Qwen model downloads from Hugging Face on first use and needs significant disk/RAM; its inference is not automatically invoked by `/api/predict` yet.
