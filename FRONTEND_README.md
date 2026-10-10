# SmartLedger Frontend — Accountant Workspace

> **Intelligent Financial Voucher Classification**  
> Built with React 18, TypeScript (Strict), Tailwind CSS ("Executive Slate" Design System), and TanStack Query.

---

## 1. Quick Start

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v11+`

### Installation
```bash
# Clone and enter the repository
cd hackathon

# Install dependencies
npm install

# Start local development server (runs on port 3000)
npm run dev
```

The application will be live at `http://localhost:3000`.

### Production Build
```bash
# Compile TypeScript and bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Environment Variables & Backend Integration

The frontend is architected to work seamlessly with an in-memory stateful mock store today and plug into the real FastAPI backend tomorrow without changing component code.

Create a `.env` file in the project root:

```env
# Set to 'true' to use the in-memory mock engine with 300 realistic Indian transactions
# Set to 'false' to call the live FastAPI backend
VITE_USE_MOCKS=true

# FastAPI backend base endpoint (when VITE_USE_MOCKS is false)
VITE_API_BASE_URL=http://localhost:8000/api

# Authentication feature flag (default: false)
# false = direct access to all pages without login, no auth headers, no 401 redirects
# true  = requires login, validates JWT tokens, activates login route & auth checks
VITE_AUTH_ENABLED=false
```

### How to Switch from Mocks to the Real Backend:
1. Ensure the FastAPI backend server is running on `http://localhost:8000`.
2. Change `VITE_USE_MOCKS=false` in `.env` (or run `VITE_USE_MOCKS=false npm run dev`).
3. The API client in `src/api/client.ts` will immediately dispatch real HTTP requests to `VITE_API_BASE_URL`. When `VITE_AUTH_ENABLED=false`, requests omit the `Authorization` header.
4. Refer to `API_CONTRACT.md` for the exact endpoint specifications and schemas expected by the frontend.

---

## 3. Design System ("Executive Slate") Implementation

The frontend strictly implements the tokens and principles defined in `DESIGN.md`:
- **Theme Support:** Both light mode (`[data-theme="light"]`) and dark mode (`[data-theme="dark"]`, default) are powered by native CSS custom properties.
- **Palette Mapping:** Muted corporate palette (`--color-bg-base`, `--color-surface-card`, `--color-accent-primary`, `--color-status-success`, etc.) mapped into Tailwind utility classes.
- **Typography:** Hanken Grotesk loaded via Google Fonts with `headline-xl` through `label-sm` scales.
- **Tabular Figures:** `font-variant-numeric: tabular-nums` enforced across all financial amounts (INR), percentages, dates, and invoice IDs.
- **Formatters:** Indian currency formatting via `Intl.NumberFormat('en-IN')` (e.g. ₹50,000, ₹1,25,000.00).
- **Styleguide Route:** A dedicated hidden styleguide is accessible at `/styleguide` showcasing all UI primitives, domain badges, and themes.

---

## 4. Key Pages & Features

1. **Dashboard (`/dashboard` & `/`):**
   - Default landing page with fintech KPI cards (total processed, auto-classified %, pending review, mean confidence).
   - Horizontal Recharts bar chart for top voucher types with custom tooltip and share percentages.
   - Recharts donut chart for routing outcome distribution with center totals and hover segment highlighting.
   - Attention panel linking directly into the review queue.

2. **Upload (`/upload`):**
   - Drag-and-drop zone for `.xlsx` and `.csv` files up to 25MB.
   - In-browser client-side parsing via SheetJS (`xlsx`) and `papaparse`.
   - Real-time schema validation (mandatory columns check, row counts, missing field warnings).
   - Toggles for Qwen LLM reasoning and auto-routing.

3. **Batches (`/batches` and `/batches/:id`):**
   - Batch listing with processing states and auto-classified ratios.
   - Live execution view with real-time polling simulation and a 6-stage Stepper:
     `Validation → Evidence & Intent → ML Prediction → Qwen Reasoning → Fusion → Routing`.
   - Completion summary with voucher category distribution and export triggers.

4. **Transactions (`/transactions`):**
   - Sortable, paginated data table with row selection and sticky headers.
   - Advanced filters: Multi-select voucher filter across all 27 categories, status, confidence tiers, and full-text search.
   - Filters sync bidirectionally to URL search parameters.
   - Bulk actions (send selected to review, export selected).
   - Export to Excel (`.xlsx`), CSV (`.csv`), or JSON (`.json`).

5. **Transaction Detail (`/transactions/:id`):**
   - The heart of the explainability system.
   - Raw key-value ledger fields.
   - Transaction Intent Profile with directional `EvidenceFlow` (party, goods, money).
   - `EvidenceMatrix` evaluating signals against candidate vouchers.
   - Side-by-side `ModelComparisonCard` (Scikit-Learn probability vs Qwen2.5 reasoning).
   - Audit trail timeline of decision stages.
   - Interactive review panel for flagged records (Confirm or Correct with `VoucherSelect`).

6. **Review Queue (`/review`):**
   - Human-in-the-loop review interface sorted by lowest confidence first.
   - Split view / drawer inspector with reason tagging.
   - Keyboard shortcut (`C` to confirm) and auto-advance to next record.
   - Optimistic updates with rollback on error.
   - Records reviewer name as "Local Reviewer" when auth is disabled.

7. **Analytics (`/analytics`):**
   - Evaluation metrics: Macro F1 (primary), Accuracy, Precision, Recall.
   - Per-category F1 score chart across accounting classes.
   - Single-hue confusion matrix heatmap and hard-negative pairs analysis.
   - Confidence calibration curve with Expected Calibration Error (ECE) and Brier scores.
   - Inference latency statistics.

8. **Settings (`/settings`):**
   - Theme toggle (Dark / Light mode).
   - Confidence threshold cutoff slider (default 0.85).
   - Model specifications (Qwen2.5-3B-Instruct).
   - Reference guide for all 27 voucher categories across 4 functional groups.
   - Modular feature flag toggles (`/src/config/features.ts`) for MVP staging.

9. **Authentication & Login (`/login`, available behind feature flag):**
   - Direct access enabled by default: SmartLedger opens directly on the Dashboard without authentication hurdles (`VITE_AUTH_ENABLED=false`).
   - When `VITE_AUTH_ENABLED=true` is set, full React Hook Form + Zod schema validation, JWT bearer token issuance, protected routes, and `/auth/me` session validation are enabled.

---

## 5. Project Architecture

```
/src
  /api               # Centralized REST modules (batches, transactions, review, auth, etc.)
  /components
    /ui              # Reusable design primitives (Button, Input, Card, DataTable, Modal, etc.)
    /domain          # SmartLedger widgets (StatusBadge, ConfidenceIndicator, EvidenceFlow, etc.)
    /layout          # AppShell, Sidebar, Header
  /config            # Modular feature flags (features.ts)
  /context           # React contexts (ThemeContext, AuthContext, ToastContext)
  /mocks             # Stateful mock store (300 realistic Indian transactions)
  /pages             # Application view controllers
  /types             # TypeScript domain schemas and contracts
  /utils             # Currency (INR), date, percentage formatting & export helpers
```
