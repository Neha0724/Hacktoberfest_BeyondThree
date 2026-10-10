

import { useEffect, useState } from "react";

import {

  Activity,

  ArrowRight,

  BrainCircuit,

  CheckCircle2,

  Clock3,

  FileText,
  FileSpreadsheet,
  Upload,
  Download,

  History,

  LayoutDashboard,

  LoaderCircle,

  Menu,

  RefreshCw,

  Search,

  Settings,

  ShieldCheck,

  Sparkles,

  TrendingUp,

  TriangleAlert,

  Wallet,

  X,

  Zap,

} from "lucide-react";



const API = import.meta.env.VITE_API_URL || "http://localhost:8001";



const CATEGORIES = [

  "Purchase Order",

  "Rejection Out",

  "Purchase Return / Debit Note",

  "Sales",

  "Receipt Note",

  "Material Out",

  "Sales Return / Credit Note",

  "Contra",

  "Payment",

  "Salary / Payroll",

  "Purchase",

  "Export",

  "Job Work Out Order",

  "Delivery Note",

  "Import",

  "Rejection In",

  "Journal",

  "Expense",

  "Stock Journal",

  "Physical Stock",

  "Receipt",

  "Job Work In Order",

  "Material In",

  "Sales Order",

];



const NAVIGATION = [

  { label: "Overview", icon: LayoutDashboard },

  { label: "Classify Voucher", icon: Sparkles },

  { label: "Prediction History", icon: History },

  { label: "Settings", icon: Settings },

];



const initialForm = {

  description: "",

  amount: "",

  party_name: "",

  transaction_type: "",

};



function Panel({ children, className = "" }) {

  return (

    <section

      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}

    >

      {children}

    </section>

  );

}



function SectionTitle({ title, subtitle, action }) {

  return (

    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">

      <div>

        <h2 className="text-lg font-bold text-slate-900">{title}</h2>

        {subtitle && (

          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

        )}

      </div>

      {action}

    </div>

  );

}



function StatusPill({ status, children }) {

  const styles = {

    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",

    warning: "bg-amber-50 text-amber-700 ring-amber-200",

    error: "bg-rose-50 text-rose-700 ring-rose-200",

    neutral: "bg-slate-100 text-slate-600 ring-slate-200",

    info: "bg-sky-50 text-sky-700 ring-sky-200",

  };



  return (

    <span

      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${

        styles[status] || styles.neutral

      }`}

    >

      {children}

    </span>

  );

}



function MetricCard({ title, value, description, icon: Icon, tone }) {

  const tones = {

    blue: "bg-blue-50 text-blue-700",

    teal: "bg-teal-50 text-teal-700",

    violet: "bg-violet-50 text-violet-700",

    amber: "bg-amber-50 text-amber-700",

  };



  return (

    <Panel>

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">

            {value}

          </p>

          <p className="mt-2 text-xs text-slate-500">{description}</p>

        </div>

        <div className={`rounded-xl p-3 ${tones[tone] || tones.blue}`}>

          <Icon size={21} />

        </div>

      </div>

    </Panel>

  );

}



function PredictionCard({ result }) {

  if (!result) return null;



  const ml = result.ml || {};

  const llm = result.llm || ml.llm || {};

  const mlCategory =

    ml.predicted_category || result.predicted_category || "Unavailable";

  const llmCategory = llm.predicted_category || "Unavailable";

  const finalCategory = result.predicted_category || mlCategory;

  const confidence = Number(result.confidence ?? ml.probability ?? 0);

  const confidencePercent = Math.max(

    0,

    Math.min(100, confidence <= 1 ? confidence * 100 : confidence)

  );



  const reviewRequired = Boolean(result.needs_review);



  return (

    <div className="space-y-5">

      <Panel className="border-teal-200 bg-gradient-to-br from-teal-50 via-white to-blue-50">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="rounded-lg bg-teal-100 p-2 text-teal-700">

                <CheckCircle2 size={20} />

              </span>

              <span className="text-sm font-semibold text-teal-800">

                Classification Result

              </span>

            </div>



            <p className="text-sm text-slate-500">Recommended category</p>

            <h3 className="mt-1 text-2xl font-bold text-slate-900">

              {finalCategory}

            </h3>

          </div>



          <StatusPill status={reviewRequired ? "warning" : "success"}>

            {reviewRequired ? "Review Required" : "No Review Flag"}

          </StatusPill>

        </div>



        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-white bg-white/80 p-4">

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">

              <BrainCircuit size={17} className="text-blue-600" />

              ML Prediction

            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">

              {mlCategory}

            </p>

            <p className="mt-1 text-xs text-slate-500">

              {ml.model || "ML classifier"}

            </p>

          </div>



          <div className="rounded-xl border border-white bg-white/80 p-4">

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">

              <Sparkles size={17} className="text-violet-600" />

              Groq LLM Prediction

            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">

              {llmCategory}

            </p>

            <p className="mt-1 text-xs text-slate-500">

              {llm.status === "success"

                ? llm.model || "LLM connected"

                : "LLM unavailable"}

            </p>

          </div>

        </div>



        <div className="mt-5">

          <div className="mb-2 flex justify-between text-sm">

            <span className="font-medium text-slate-600">

              ML confidence score

            </span>

            <span className="font-bold text-slate-900">

              {confidencePercent.toFixed(2)}%

            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">

            <div

              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all"

              style={{ width: `${confidencePercent}%` }}

            />

          </div>

          <p className="mt-2 text-xs text-slate-500">

            This is the ML model's reported score, not the overall model accuracy.

          </p>

        </div>



        {reviewRequired && (

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

            <TriangleAlert

              size={19}

              className="mt-0.5 shrink-0 text-amber-700"

            />

            <div>

              <p className="text-sm font-semibold text-amber-900">

                Human verification recommended

              </p>

              <p className="mt-1 text-sm text-amber-800">

                {result.reason ||

                  "The prediction requires additional verification."}

              </p>

            </div>

          </div>

        )}

      </Panel>



      <Panel>

        <SectionTitle

          title="LLM reasoning"

          subtitle="Explanation returned by the Groq-powered model"

        />



        {llm.status === "success" ? (

          <>

            <div className="rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-950">

              {llm.reasoning || "No explanation returned by the model."}

            </div>



            <div className="mt-4 flex flex-wrap items-center gap-3">

              <StatusPill status="success">LLM Connected</StatusPill>

              <StatusPill

                status={

                  llm.predicted_category === mlCategory ? "success" : "warning"

                }

              >

                {llm.predicted_category === mlCategory

                  ? "Models Agree"

                  : "Models Disagree"}

              </StatusPill>

              <StatusPill status={llm.needs_review ? "warning" : "neutral"}>

                {llm.needs_review ? "LLM Requests Review" : "LLM Review Flag Off"}

              </StatusPill>

            </div>

          </>

        ) : (

          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">

            LLM response unavailable. The ML prediction is still displayed.

          </div>

        )}

      </Panel>



      <Panel>

        <SectionTitle

          title="Transaction evidence"

          subtitle="The input passed to the classification pipeline"

        />

        <p className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">

          {result.evidence || result.input || "No evidence available."}

        </p>



        {Array.isArray(ml.top_predictions) &&

          ml.top_predictions.length > 0 && (

            <div className="mt-5">

              <h4 className="mb-3 text-sm font-semibold text-slate-800">

                Other ML predictions

              </h4>

              <div className="space-y-3">

                {ml.top_predictions.map((item, index) => {

                  const score = Number(item.probability || 0);

                  const percent = Math.max(

                    0,

                    Math.min(100, score <= 1 ? score * 100 : score)

                  );



                  return (

                    <div key={`${item.category}-${index}`}>

                      <div className="mb-1 flex justify-between gap-3 text-sm">

                        <span className="text-slate-700">

                          {item.category}

                        </span>

                        <span className="font-medium text-slate-600">

                          {percent.toFixed(2)}%

                        </span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                        <div

                          className="h-full rounded-full bg-blue-500"

                          style={{ width: `${percent}%` }}

                        />

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          )}

      </Panel>

    </div>

  );

}



export default function App() {

  const [page, setPage] = useState("Overview");

  const [mobileMenu, setMobileMenu] = useState(false);

  const [apiStatus, setApiStatus] = useState("checking");

  const [form, setForm] = useState(initialForm);

  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [healthMessage, setHealthMessage] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState("");
  const [csvSuccess, setCsvSuccess] = useState("");



  async function checkHealth() {

    setApiStatus("checking");

    setHealthMessage("");



    try {

      const response = await fetch(`${API}/api/health`);

      if (!response.ok) throw new Error("API health check failed");



      setApiStatus("online");

      setHealthMessage("Backend is responding.");

    } catch {

      setApiStatus("offline");

      setHealthMessage("Cannot connect to the backend. Check that FastAPI is running.");

    }

  }



  useEffect(() => {

    checkHealth();

  }, []);



  function updateField(event) {

    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));

  }



  async function classifyVoucher(event) {

    event.preventDefault();

    setError("");

    setResult(null);



    if (!form.description.trim()) {

      setError("Please enter a transaction description.");

      return;

    }



    setLoading(true);



    const fields = {};

    if (form.amount.trim()) fields.amount = Number(form.amount);

    if (form.party_name.trim()) fields.party_name = form.party_name.trim();

    if (form.transaction_type.trim()) {

      fields.transaction_type = form.transaction_type.trim();

    }



    try {

      const response = await fetch(`${API}/api/predict`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          description: form.description.trim(),

          fields,

        }),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error(

          data.detail || data.message || "Voucher classification failed."

        );

      }



      setResult(data);



      const llm = data.llm || data.ml?.llm || {};

      const record = {

        id: `${Date.now()}-${Math.random()}`,

        createdAt: new Date().toLocaleString(),

        input: data.input || form.description,

        category: data.predicted_category || data.ml?.predicted_category || "Unknown",

        llmCategory: llm.predicted_category || "Unavailable",

        confidence: Number(data.confidence || 0),

        needsReview: Boolean(data.needs_review),

        llmStatus: llm.status || "unavailable",

      };



      setHistory((previous) => [record, ...previous]);

      setPage("Classify Voucher");

    } catch (err) {

      setError(

        `${err.message || "Something went wrong."} Check your backend and API configuration.`

      );

    } finally {

      setLoading(false);

    }

  }



  async function classifyCsv(event) {
    event.preventDefault();
    setCsvError("");
    setCsvSuccess("");

    if (!csvFile) {
      setCsvError("Please choose a CSV file first.");
      return;
    }
    if (!csvFile.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a .csv file.");
      return;
    }
    if (csvFile.size > 5 * 1024 * 1024) {
      setCsvError("The file must be 5 MB or smaller.");
      return;
    }

    setCsvLoading(true);
    try {
      const body = new FormData();
      body.append("file", csvFile);
      const response = await fetch(`${API}/api/predict/csv`, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        let message = "CSV classification failed.";
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          message = data.detail || data.message || message;
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "voucher_results.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setCsvSuccess("Classification complete. Your results CSV has been downloaded.");
    } catch (err) {
      setCsvError(`${err.message || "Something went wrong."} Check that the CSV endpoint is enabled and the backend is running.`);
    } finally {
      setCsvLoading(false);
    }
  }

  function openPage(label) {

    setPage(label);

    setMobileMenu(false);

  }



  const reviewCount = history.filter((item) => item.needsReview).length;

  const successfulLlmCount = history.filter(

    (item) => item.llmStatus === "success"

  ).length;



  return (

    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">

      <aside

        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${

          mobileMenu ? "translate-x-0" : "-translate-x-full"

        }`}

      >

        <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-sm">

            <Wallet size={21} />

          </div>

          <div>

            <h1 className="text-lg font-bold tracking-tight text-slate-900">

              SmartLedger

            </h1>

            <p className="text-xs text-slate-500">Intelligent accounting</p>

          </div>



          <button

            onClick={() => setMobileMenu(false)}

            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"

            aria-label="Close menu"

          >

            <X size={19} />

          </button>

        </div>



        <div className="px-4 pt-7">

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">

            Workspace

          </p>



          <nav className="space-y-1">

            {NAVIGATION.map(({ label, icon: Icon }) => {

              const active = page === label;

              return (

                <button

                  key={label}

                  onClick={() => openPage(label)}

                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${

                    active

                      ? "bg-teal-50 text-teal-800"

                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"

                  }`}

                >

                  <Icon size={19} />

                  {label}

                  {label === "Prediction History" && history.length > 0 && (

                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">

                      {history.length}

                    </span>

                  )}

                </button>

              );

            })}

          </nav>

        </div>



        <div className="mt-auto p-4">

          <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-blue-50 p-4">

            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">

              <ShieldCheck size={19} />

            </div>

            <p className="text-sm font-semibold text-slate-800">

              Human-in-the-loop

            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">

              Uncertain predictions can be flagged for verification.

            </p>

          </div>

          <p className="mt-4 text-center text-[11px] text-slate-400">

            SmartLedger · ML + LLM

          </p>

        </div>

      </aside>



      {mobileMenu && (

        <button

          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"

          onClick={() => setMobileMenu(false)}

          aria-label="Close navigation overlay"

        />

      )}



      <div className="min-h-screen lg:pl-64">

        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">

          <div className="flex items-center gap-3">

            <button

              onClick={() => setMobileMenu(true)}

              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"

              aria-label="Open menu"

            >

              <Menu size={21} />

            </button>



            <div>

              <p className="text-sm font-semibold text-slate-900">{page}</p>

              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">

                Voucher intelligence workspace

              </p>

            </div>

          </div>



          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 sm:flex">

              <span

                className={`h-2 w-2 rounded-full ${

                  apiStatus === "online"

                    ? "bg-emerald-500"

                    : apiStatus === "offline"

                    ? "bg-rose-500"

                    : "animate-pulse bg-amber-500"

                }`}

              />

              <span className="text-xs font-medium text-slate-600">

                API {apiStatus === "online" ? "Connected" : apiStatus === "offline" ? "Offline" : "Checking"}

              </span>

            </div>



            <button

              onClick={checkHealth}

              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"

              title="Refresh API status"

              aria-label="Refresh API status"

            >

              <RefreshCw size={17} />

            </button>



            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-sm font-bold text-white">

              S

            </div>

          </div>

        </header>



        <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-7">

          {page === "Overview" && (

            <>

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-medium text-teal-700">

                    YOUR ACCOUNTING INTELLIGENCE

                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">

                    Voucher classification, simplified.

                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                    Classify transaction evidence using machine learning and

                    LLM reasoning, with review flags for uncertain results.

                  </p>

                </div>



                <button

                  onClick={() => openPage("Classify Voucher")}

                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"

                >

                  <Sparkles size={17} />

                  Classify voucher

                  <ArrowRight size={16} />

                </button>

              </div>



              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <MetricCard

                  title="Classifications"

                  value={history.length}

                  description="In this browser session"

                  icon={FileText}

                  tone="blue"

                />

                <MetricCard

                  title="LLM responses"

                  value={successfulLlmCount}

                  description="Successful Groq responses"

                  icon={BrainCircuit}

                  tone="violet"

                />

                <MetricCard

                  title="Review required"

                  value={reviewCount}

                  description="Predictions flagged for review"

                  icon={TriangleAlert}

                  tone="amber"

                />

                <MetricCard

                  title="Backend status"

                  value={apiStatus === "online" ? "Online" : apiStatus === "offline" ? "Offline" : "…"}

                  description="FastAPI connection"

                  icon={Activity}

                  tone="teal"

                />

              </div>



              <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">

                <Panel>

                  <SectionTitle

                    title="Get started"

                    subtitle="Run a transaction through your classification pipeline."

                    action={

                      <StatusPill status={apiStatus === "online" ? "success" : apiStatus === "offline" ? "error" : "neutral"}>

                        {apiStatus === "online" ? "API Online" : apiStatus === "offline" ? "API Offline" : "Checking"}

                      </StatusPill>

                    }

                  />



                  <div className="grid gap-4 sm:grid-cols-3">

                    {[

                      {

                        number: "01",

                        title: "Enter evidence",

                        text: "Describe the transaction and provide optional details.",

                        color: "bg-blue-50 text-blue-700",

                      },

                      {

                        number: "02",

                        title: "Classify",

                        text: "The ML model and Groq LLM analyze the evidence.",

                        color: "bg-violet-50 text-violet-700",

                      },

                      {

                        number: "03",

                        title: "Verify",

                        text: "Review the category, reasoning and confidence.",

                        color: "bg-teal-50 text-teal-700",

                      },

                    ].map((step) => (

                      <div

                        key={step.number}

                        className="rounded-xl border border-slate-100 p-4"

                      >

                        <span className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold ${step.color}`}>

                          {step.number}

                        </span>

                        <h3 className="mt-4 text-sm font-bold text-slate-900">

                          {step.title}

                        </h3>

                        <p className="mt-2 text-xs leading-5 text-slate-500">

                          {step.text}

                        </p>

                      </div>

                    ))}

                  </div>



                  <button

                    onClick={() => openPage("Classify Voucher")}

                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"

                  >

                    Open classifier <ArrowRight size={16} />

                  </button>

                </Panel>



                <Panel>

                  <SectionTitle

                    title="System health"

                    subtitle="Current backend connection"

                  />



                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                    <div className={`rounded-xl p-3 ${apiStatus === "online" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>

                      <Activity size={21} />

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-slate-900">

                        FastAPI backend

                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">{API}</p>

                    </div>

                    <StatusPill status={apiStatus === "online" ? "success" : apiStatus === "offline" ? "error" : "neutral"}>

                      {apiStatus}

                    </StatusPill>

                  </div>



                  <p className="mt-3 text-xs leading-5 text-slate-500">

                    {healthMessage || "Checking backend health..."}

                  </p>



                  <button

                    onClick={checkHealth}

                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"

                  >

                    <RefreshCw size={15} /> Check connection

                  </button>



                  <div className="mt-5 border-t border-slate-100 pt-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">

                      Pipeline

                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      <StatusPill status="info">Transaction</StatusPill>

                      <ArrowRight size={13} className="text-slate-400" />

                      <StatusPill status="info">ML</StatusPill>

                      <ArrowRight size={13} className="text-slate-400" />

                      <StatusPill status="info">LLM</StatusPill>

                    </div>

                  </div>

                </Panel>

              </div>



              <Panel>

                <SectionTitle

                  title="Recent predictions"

                  subtitle="The latest classifications from this session"

                  action={

                    <button

                      onClick={() => openPage("Prediction History")}

                      className="text-sm font-semibold text-teal-700 hover:text-teal-900"

                    >

                      View history

                    </button>

                  }

                />



                {history.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">

                    <Clock3 className="mx-auto text-slate-300" size={28} />

                    <p className="mt-3 text-sm font-semibold text-slate-700">

                      No predictions yet

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Your recent voucher classifications will appear here.

                    </p>

                  </div>

                ) : (

                  <HistoryTable history={history.slice(0, 5)} />

                )}

              </Panel>

            </>

          )}



          {page === "Classify Voucher" && (

            <>

              <div>

                <h2 className="text-2xl font-bold text-slate-900">

                  Classify a voucher

                </h2>

                <p className="mt-2 text-sm text-slate-500">

                  Provide transaction evidence and compare ML and LLM outputs.

                </p>

              </div>



              <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">

                <Panel>

                  <SectionTitle

                    title="Transaction details"

                    subtitle="Description is required; other fields are optional."

                  />



                  <form onSubmit={classifyVoucher} className="space-y-5">

                    <div>

                      <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">

                        Transaction description <span className="text-rose-500">*</span>

                      </label>

                      <textarea

                        id="description"

                        name="description"

                        rows={5}

                        value={form.description}

                        onChange={updateField}

                        placeholder="e.g. Received cash from customer against outstanding invoice"

                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"

                        required

                      />

                    </div>



                    <div>

                      <label htmlFor="amount" className="mb-2 block text-sm font-semibold text-slate-700">

                        Amount

                      </label>

                      <input

                        id="amount"

                        name="amount"

                        type="number"

                        min="0"

                        step="any"

                        value={form.amount}

                        onChange={updateField}

                        placeholder="e.g. 25000"

                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"

                      />

                    </div>



                    <div>

                      <label htmlFor="party_name" className="mb-2 block text-sm font-semibold text-slate-700">

                        Party name

                      </label>

                      <input

                        id="party_name"

                        name="party_name"

                        value={form.party_name}

                        onChange={updateField}

                        placeholder="e.g. ABC Customer"

                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"

                      />

                    </div>



                    <div>

                      <label htmlFor="transaction_type" className="mb-2 block text-sm font-semibold text-slate-700">

                        Transaction type

                      </label>

                      <input

                        id="transaction_type"

                        name="transaction_type"

                        value={form.transaction_type}

                        onChange={updateField}

                        placeholder="e.g. Bank transfer, cash, invoice"

                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"

                      />

                    </div>



                    {error && (

                      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">

                        <TriangleAlert size={18} className="mt-0.5 shrink-0" />

                        <p>{error}</p>

                      </div>

                    )}



                    <button

                      type="submit"

                      disabled={loading}

                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:from-teal-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"

                    >

                      {loading ? (

                        <>

                          <LoaderCircle size={18} className="animate-spin" />

                          Classifying...

                        </>

                      ) : (

                        <>

                          <Zap size={18} />

                          Classify transaction

                          <ArrowRight size={16} />

                        </>

                      )}

                    </button>



                    <p className="text-center text-xs text-slate-400">

                      Powered by your FastAPI ML + Groq LLM pipeline

                    </p>

                  </form>

                </Panel>



                <div>

                  {loading ? (

                    <Panel className="py-16 text-center">

                      <LoaderCircle className="mx-auto animate-spin text-teal-600" size={34} />

                      <p className="mt-4 font-semibold text-slate-800">

                        Analyzing transaction

                      </p>

                      <p className="mt-2 text-sm text-slate-500">

                        Waiting for the ML and LLM results...

                      </p>

                    </Panel>

                  ) : result ? (

                    <PredictionCard result={result} />

                  ) : (

                    <Panel className="flex min-h-[350px] flex-col items-center justify-center text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-blue-100 text-teal-700">

                        <BrainCircuit size={31} />

                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-900">

                        Your results will appear here

                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">

                        Submit a transaction to view its predicted category,

                        ML score, LLM reasoning and review status.

                      </p>

                    </Panel>

                  )}

                </div>

              </div>


              <Panel>
                <SectionTitle
                  title="Bulk classify with CSV"
                  subtitle="Upload multiple transactions and download their predicted categories as a results CSV."
                />
                <form onSubmit={classifyCsv} className="space-y-4">
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <FileSpreadsheet size={24} />
                    </div>
                    <label htmlFor="csv-upload" className="mt-3 block text-sm font-semibold text-slate-800">
                      Choose your transaction CSV
                    </label>
                    <p className="mt-1 text-xs text-slate-500">CSV only · Maximum 5 MB and 200 rows per upload</p>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => {
                        setCsvFile(event.target.files?.[0] || null);
                        setCsvError("");
                        setCsvSuccess("");
                      }}
                      className="mx-auto mt-4 block max-w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
                    />
                    {csvFile && (
                      <p className="mt-3 break-all text-xs font-medium text-slate-600">
                        Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  {csvError && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                      <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                      <p>{csvError}</p>
                    </div>
                  )}
                  {csvSuccess && (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                      <p>{csvSuccess}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-xs leading-5 text-slate-500">
                      Include transaction details as columns. If your file has a “Voucher Category” column, it is treated as the actual label and excluded from prediction input.
                    </p>
                    <button
                      type="submit"
                      disabled={csvLoading || !csvFile}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {csvLoading ? (
                        <><LoaderCircle size={17} className="animate-spin" /> Classifying CSV...</>
                      ) : (
                        <><Upload size={17} /> Classify and download <Download size={16} /></>
                      )}
                    </button>
                  </div>
                </form>
              </Panel>

            </>

          )}



          {page === "Prediction History" && (

            <>

              <div>

                <h2 className="text-2xl font-bold text-slate-900">

                  Prediction history

                </h2>

                <p className="mt-2 text-sm text-slate-500">

                  Classifications performed during this browser session.

                </p>

              </div>



              <Panel>

                <SectionTitle

                  title="All predictions"

                  subtitle={`${history.length} classification${history.length === 1 ? "" : "s"} in this session`}

                  action={

                    history.length > 0 ? (

                      <button

                        onClick={() => {

                          setHistory([]);

                          setResult(null);

                        }}

                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"

                      >

                        Clear history

                      </button>

                    ) : null

                  }

                />



                {history.length === 0 ? (

                  <div className="py-12 text-center">

                    <History className="mx-auto text-slate-300" size={30} />

                    <p className="mt-3 font-semibold text-slate-700">

                      History is empty

                    </p>

                    <button

                      onClick={() => openPage("Classify Voucher")}

                      className="mt-4 text-sm font-semibold text-teal-700"

                    >

                      Classify your first voucher →

                    </button>

                  </div>

                ) : (

                  <HistoryTable history={history} />

                )}

              </Panel>

            </>

          )}



          {page === "Settings" && (

            <>

              <div>

                <h2 className="text-2xl font-bold text-slate-900">Settings</h2>

                <p className="mt-2 text-sm text-slate-500">

                  API connection and classifier configuration.

                </p>

              </div>



              <Panel>

                <SectionTitle

                  title="Backend connection"

                  subtitle="The frontend sends requests to your FastAPI service."

                  action={

                    <StatusPill status={apiStatus === "online" ? "success" : apiStatus === "offline" ? "error" : "neutral"}>

                      {apiStatus}

                    </StatusPill>

                  }

                />



                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  API base URL

                </label>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <input

                    readOnly

                    value={API}

                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"

                  />

                  <button

                    onClick={checkHealth}

                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"

                  >

                    <RefreshCw size={16} /> Test connection

                  </button>

                </div>



                <p className="mt-3 text-sm text-slate-500">{healthMessage}</p>



                <div className="mt-6 border-t border-slate-100 pt-5">

                  <h3 className="font-semibold text-slate-900">

                    Supported voucher categories

                  </h3>

                  <p className="mt-1 text-sm text-slate-500">

                    Categories expected by the LLM classifier.

                  </p>



                  <div className="mt-4 flex flex-wrap gap-2">

                    {CATEGORIES.map((category) => (

                      <span

                        key={category}

                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"

                      >

                        {category}

                      </span>

                    ))}

                  </div>

                </div>

              </Panel>



              <Panel>

                <SectionTitle

                  title="Model configuration"

                  subtitle="Models reported by the backend response"

                />

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <div className="flex items-center gap-2 text-blue-700">

                      <BrainCircuit size={20} />

                      <span className="text-sm font-semibold">ML classifier</span>

                    </div>

                    <p className="mt-3 font-semibold text-slate-900">

                      TF-IDF + Logistic Regression

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Local model loaded by the backend

                    </p>

                  </div>



                  <div className="rounded-xl border border-slate-200 p-4">

                    <div className="flex items-center gap-2 text-violet-700">

                      <Sparkles size={20} />

                      <span className="text-sm font-semibold">LLM</span>

                    </div>

                    <p className="mt-3 font-semibold text-slate-900">

                      Groq API

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Model name is provided by the backend response.

                    </p>

                  </div>

                </div>

              </Panel>

            </>

          )}



          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">

            <span>SmartLedger · Intelligent Voucher Classification</span>

            <span>Machine learning with LLM-assisted reasoning</span>

          </footer>

        </main>

      </div>

    </div>

  );

}



function HistoryTable({ history }) {

  return (

    <div className="overflow-x-auto">

      <table className="w-full min-w-[680px] border-collapse text-left">

        <thead>

          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">

            <th className="px-3 py-3 font-semibold">Transaction</th>

            <th className="px-3 py-3 font-semibold">ML category</th>

            <th className="px-3 py-3 font-semibold">LLM category</th>

            <th className="px-3 py-3 font-semibold">Status</th>

            <th className="px-3 py-3 font-semibold">Time</th>

          </tr>

        </thead>



        <tbody>

          {history.map((item) => (

            <tr

              key={item.id}

              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"

            >

              <td className="max-w-[230px] px-3 py-4">

                <p className="truncate text-sm font-medium text-slate-800">

                  {item.input}

                </p>

                <p className="mt-1 text-xs text-slate-400">

                  ML score: {(item.confidence <= 1

                    ? item.confidence * 100

                    : item.confidence

                  ).toFixed(2)}%

                </p>

              </td>



              <td className="px-3 py-4 text-sm text-slate-700">

                {item.category}

              </td>



              <td className="px-3 py-4 text-sm text-slate-700">

                {item.llmCategory}

              </td>



              <td className="px-3 py-4">

                <StatusPill status={item.needsReview ? "warning" : "success"}>

                  {item.needsReview ? "Review" : "Classified"}

                </StatusPill>

              </td>



              <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">

                {item.createdAt}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}