"use client";

import { useState } from "react";
import Link from "next/link";

type DisputeType = "parking" | "credit-card" | "insurance";

interface Config {
  title: string;
  emoji: string;
  color: string;
}

interface FormData {
  // Step 0
  summary: string;
  date: string;
  amount: string;
  // Step 1
  details: string;
  location: string;
  counterparty: string;
  // Step 2
  evidence: string;
  priorContact: string;
  desiredOutcome: string;
  // Style
  tone: string;
  length: string;
  emphasis: string;
  // Result
  letter: string;
}

interface SendToInfo {
  recipient: string;
  methods: string[];
  deadline: string;
}

const STEP_LABELS = ["What Happened", "Key Details", "Evidence", "Your Letter"];

// ─── Style option definitions ────────────────────────────────────────────────
const TONE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Formal & measured", icon: "🎩" },
  { value: "assertive",    label: "Assertive",    description: "Direct & firm",     icon: "⚡" },
  { value: "friendly",     label: "Friendly",     description: "Polite but clear",  icon: "🤝" },
];

const LENGTH_OPTIONS = [
  { value: "brief",    label: "Brief",    description: "~1 page, concise", icon: "📄" },
  { value: "standard", label: "Standard", description: "Balanced",         icon: "📋" },
  { value: "detailed", label: "Detailed", description: "Comprehensive",    icon: "📚" },
];

const EMPHASIS_OPTIONS = [
  { value: "evidence", label: "Evidence", description: "Lead with proof",  icon: "🔍" },
  { value: "legal",    label: "Legal",    description: "Cite regulations", icon: "⚖️" },
  { value: "outcome",  label: "Outcome",  description: "Focus on demand",  icon: "🎯" },
];

// ─── Reusable style picker ───────────────────────────────────────────────────
function StylePicker({
  label,
  options,
  value,
  onChange,
  accentColor = "blue",
}: {
  label: string;
  options: { value: string; label: string; description: string; icon: string }[];
  value: string;
  onChange: (v: string) => void;
  accentColor?: string;
}) {
  const activeClass =
    accentColor === "violet"
      ? "border-violet-400 bg-violet-50 text-violet-700"
      : accentColor === "emerald"
      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
      : "border-blue-400 bg-blue-50 text-blue-700";

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`p-3 rounded-xl border text-left transition-all ${
              value === opt.value
                ? activeClass
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="text-lg mb-1">{opt.icon}</div>
            <div className="text-xs font-bold leading-tight">{opt.label}</div>
            <div className="text-xs text-slate-400 mt-0.5 leading-tight">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Where to send ───────────────────────────────────────────────────────────
function getSendToInfo(disputeType: DisputeType, form: FormData): SendToInfo {
  const who = form.counterparty;
  switch (disputeType) {
    case "parking":
      return {
        recipient: `${who || "The Issuing Agency"} — Parking Appeals / Hearing Division`,
        methods: [
          `Search online: "${who || "agency name"} parking ticket appeal" to find their portal`,
          "By mail: Certified mail with return receipt to the address on your ticket",
          "In person: Bring this letter + evidence copies to their office",
        ],
        deadline: "Most agencies require appeals within 21–30 days of the ticket date — act quickly!",
      };
    case "credit-card":
      return {
        recipient: "Your Card Issuer — Billing Disputes Dept (not the merchant)",
        methods: [
          "Online: Log into your card account → 'Dispute a charge'",
          "Phone: Call the number on the back of your card and reference this letter",
          "By mail: Send to the billing disputes address on your statement",
        ],
        deadline: "Under the FCBA you have 60 days from the statement showing the charge — don't wait.",
      };
    case "insurance":
      return {
        recipient: `${who || "Your Insurance Company"} — Claims Appeals Department`,
        methods: [
          "By mail: Certified mail to the address on your Explanation of Benefits (EOB)",
          "Online: Log into your insurer's member portal and file a formal appeal",
          "Phone: Call member services and ask them to log your appeal",
        ],
        deadline:
          "Most insurers require appeals within 180 days of the denial — check your EOB for your exact deadline.",
      };
  }
}

// ─── Field configs per dispute type ─────────────────────────────────────────
const fieldConfig: Record<
  DisputeType,
  {
    amountLabel: string;
    amountPlaceholder: string;
    counterpartyLabel: string;
    counterpartyPlaceholder: string;
    locationLabel: string;
    locationPlaceholder: string;
    detailsLabel: string;
    detailsPlaceholder: string;
    summaryPlaceholder: string;
  }
> = {
  parking: {
    amountLabel: "Ticket Amount",
    amountPlaceholder: "e.g. $75",
    counterpartyLabel: "Issuing Agency",
    counterpartyPlaceholder: "e.g. City of San Francisco SFMTA",
    locationLabel: "Location / Street Address",
    locationPlaceholder: "e.g. 123 Main St, San Francisco",
    detailsLabel: "What specifically was wrong with this ticket?",
    detailsPlaceholder:
      "e.g. The parking sign was obscured by a tree branch. The meter was also showing 'OUT OF ORDER'.",
    summaryPlaceholder:
      "e.g. I received a parking ticket on March 15. The meter was broken and showed 'Out of Order' when I arrived.",
  },
  "credit-card": {
    amountLabel: "Disputed Amount",
    amountPlaceholder: "e.g. $249.99",
    counterpartyLabel: "Merchant / Company Name",
    counterpartyPlaceholder: "e.g. Amazon, Netflix, Unknown Merchant",
    locationLabel: "Card / Account (last 4 digits)",
    locationPlaceholder: "e.g. 4521",
    detailsLabel: "Describe the charge and why it is incorrect",
    detailsPlaceholder:
      "e.g. I was charged $249.99 on March 10 by an unknown merchant. I never made this purchase.",
    summaryPlaceholder:
      "e.g. There is an unauthorized charge of $249.99 on my credit card statement from March 10.",
  },
  insurance: {
    amountLabel: "Claim Amount",
    amountPlaceholder: "e.g. $5,000",
    counterpartyLabel: "Insurance Company",
    counterpartyPlaceholder: "e.g. State Farm, Allstate",
    locationLabel: "Policy / Claim Number",
    locationPlaceholder: "e.g. CLM-2024-88491",
    detailsLabel: "Why was the claim denied or underpaid?",
    detailsPlaceholder:
      "e.g. My claim was denied citing 'pre-existing condition' but this damage occurred during the covered event.",
    summaryPlaceholder:
      "e.g. My homeowner's insurance claim for storm damage was denied on March 20.",
  },
};

// ─── Spinner icon ────────────────────────────────────────────────────────────
function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < current
                  ? "bg-green-500 text-white"
                  : i === current
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs whitespace-nowrap hidden sm:block ${
                i === current ? "text-blue-600 font-semibold" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-12 sm:w-16 mx-1 mt-[-12px] sm:mt-[-20px] transition-all duration-300 ${
                i < current ? "bg-green-400" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function DisputeFlow({
  disputeType,
  config,
}: {
  disputeType: DisputeType;
  config: Config;
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTweakPanel, setShowTweakPanel] = useState(false);
  const [form, setForm] = useState<FormData>({
    summary: "",
    date: "",
    amount: "",
    details: "",
    location: "",
    counterparty: "",
    evidence: "",
    priorContact: "",
    desiredOutcome: "",
    tone: "professional",
    length: "standard",
    emphasis: "legal",
    letter: "",
  });

  const fields = fieldConfig[disputeType];

  function update(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
  };
  const gradientClass = colorMap[config.color] ?? "from-blue-500 to-blue-600";
  const sendToInfo = getSendToInfo(disputeType, form);

  // ─── Streaming fetch ──────────────────────────────────────────────────────
  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setShowTweakPanel(false);
    setForm((f) => ({ ...f, letter: "" }));

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disputeType, form }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate letter");
      }

      setLoading(false);
      setIsStreaming(true);
      setStep(3);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.text) {
              setForm((prev) => ({ ...prev, letter: prev.letter + parsed.text }));
            }
            if (parsed.error) setError(parsed.error);
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep((s) => (s === 3 ? 3 : 2));
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }

  async function copyLetter() {
    await navigator.clipboard.writeText(form.letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Style summary tag ────────────────────────────────────────────────────
  function StyleTag({ value, options }: { value: string; options: typeof TONE_OPTIONS }) {
    const opt = options.find((o) => o.value === value);
    return opt ? (
      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
        {opt.icon} {opt.label}
      </span>
    ) : null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            ← Back
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-xl">{config.emoji}</span>
          <span className="font-semibold text-slate-900">{config.title}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <StepIndicator current={step} total={4} />

        {/* ── Step 0 — What Happened ──────────────────────────────────────── */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">What happened?</h2>
            <p className="text-slate-500 mb-6">Give us a brief overview of your dispute.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Brief Summary <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  placeholder={fields.summaryPlaceholder}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Date of Incident <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {fields.amountLabel}
                  </label>
                  <input
                    type="text"
                    value={form.amount}
                    onChange={(e) => update("amount", e.target.value)}
                    placeholder={fields.amountPlaceholder}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={!form.summary || !form.date}
                className={`px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientClass} disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1 — Key Details ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Key details</h2>
            <p className="text-slate-500 mb-6">Help us understand the specifics.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {fields.counterpartyLabel} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.counterparty}
                  onChange={(e) => update("counterparty", e.target.value)}
                  placeholder={fields.counterpartyPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {fields.locationLabel}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder={fields.locationPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  {fields.detailsLabel} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.details}
                  onChange={(e) => update("details", e.target.value)}
                  placeholder={fields.detailsPlaceholder}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!form.counterparty || !form.details}
                className={`px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientClass} disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 — Evidence + Style ───────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Evidence & letter style</h2>
            <p className="text-slate-500 mb-6">Add context, then choose how you want your letter to sound.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Evidence you have
                </label>
                <textarea
                  value={form.evidence}
                  onChange={(e) => update("evidence", e.target.value)}
                  placeholder="Describe any photos, receipts, screenshots, witnesses, or other evidence..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Prior contact attempts
                </label>
                <textarea
                  value={form.priorContact}
                  onChange={(e) => update("priorContact", e.target.value)}
                  placeholder="Have you already contacted them? What happened?"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Desired outcome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.desiredOutcome}
                  onChange={(e) => update("desiredOutcome", e.target.value)}
                  placeholder="e.g. Full refund of $75, cancel the ticket, approve the claim for $5,000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* ── Letter Style Pickers ─────────────────────────────────── */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <p className="text-sm font-bold text-slate-800">✍️ Customize your letter</p>
                <StylePicker
                  label="Tone"
                  options={TONE_OPTIONS}
                  value={form.tone}
                  onChange={(v) => update("tone", v)}
                  accentColor={config.color}
                />
                <StylePicker
                  label="Length"
                  options={LENGTH_OPTIONS}
                  value={form.length}
                  onChange={(v) => update("length", v)}
                  accentColor={config.color}
                />
                <StylePicker
                  label="Emphasis"
                  options={EMPHASIS_OPTIONS}
                  value={form.emphasis}
                  onChange={(v) => update("emphasis", v)}
                  accentColor={config.color}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!form.desiredOutcome || loading}
                className={`px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientClass} disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2`}
              >
                {loading ? (
                  <><Spinner /> Connecting...</>
                ) : (
                  "✨ Generate Letter"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Result ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Letter card */}
            <div
              className={`bg-white rounded-2xl border shadow-sm p-8 ${
                isStreaming ? "border-blue-200" : "border-green-200"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isStreaming ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                    }`}
                  >
                    {isStreaming ? <Spinner className="w-5 h-5" /> : "✓"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {isStreaming ? "Writing your letter…" : "Your dispute letter is ready!"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {isStreaming
                        ? "Claude is drafting your letter in real time"
                        : "Review, copy, and send it."}
                    </p>
                  </div>
                </div>
                {/* Current style badges */}
                {!isStreaming && form.letter && (
                  <div className="flex flex-wrap gap-1 justify-end shrink-0">
                    <StyleTag value={form.tone} options={TONE_OPTIONS} />
                    <StyleTag value={form.length} options={LENGTH_OPTIONS} />
                    <StyleTag value={form.emphasis} options={EMPHASIS_OPTIONS} />
                  </div>
                )}
              </div>

              {/* Letter text */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {form.letter || (
                  <span className="text-slate-400 italic">Starting generation…</span>
                )}
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle animate-pulse" />
                )}
              </div>

              {/* Action buttons */}
              {!isStreaming && form.letter && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={copyLetter}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                      copied
                        ? "bg-green-500 text-white"
                        : `bg-gradient-to-r ${gradientClass} text-white hover:opacity-90`
                    }`}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Letter"}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([form.letter], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `dispute-letter-${disputeType}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    ⬇ Download
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* ── Tweak & Regenerate panel ──────────────────────────────── */}
            {!isStreaming && form.letter && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowTweakPanel((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎛️</span>
                    <span className="font-semibold text-slate-800">Tweak &amp; Regenerate</span>
                    <span className="text-sm text-slate-400">— change tone, length, or emphasis</span>
                  </div>
                  <span className="text-slate-400 text-lg">{showTweakPanel ? "▲" : "▼"}</span>
                </button>

                {showTweakPanel && (
                  <div className="px-6 pb-6 space-y-4 border-t border-slate-100">
                    <div className="pt-4 space-y-4">
                      <StylePicker
                        label="Tone"
                        options={TONE_OPTIONS}
                        value={form.tone}
                        onChange={(v) => update("tone", v)}
                        accentColor={config.color}
                      />
                      <StylePicker
                        label="Length"
                        options={LENGTH_OPTIONS}
                        value={form.length}
                        onChange={(v) => update("length", v)}
                        accentColor={config.color}
                      />
                      <StylePicker
                        label="Emphasis"
                        options={EMPHASIS_OPTIONS}
                        value={form.emphasis}
                        onChange={(v) => update("emphasis", v)}
                        accentColor={config.color}
                      />
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={loading}
                      className={`w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientClass} hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40`}
                    >
                      {loading ? <><Spinner /> Generating...</> : "✨ Regenerate Letter"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Where to Send ────────────────────────────────────────────── */}
            {!isStreaming && form.letter && (
              <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📬</span>
                  <h3 className="text-lg font-bold text-slate-900">Where to send this letter</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Send to</p>
                    <p className="text-sm font-semibold text-slate-800">{sendToInfo.recipient}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">How to send</p>
                    <ul className="space-y-2">
                      {sendToInfo.methods.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-indigo-400 mt-0.5 shrink-0">{i === 0 ? "⭐" : "•"}</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <span className="text-amber-500 shrink-0">⏰</span>
                    <p className="text-sm text-amber-800">{sendToInfo.deadline}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Next Steps ───────────────────────────────────────────────── */}
            {!isStreaming && form.letter && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h3 className="font-semibold text-amber-900 mb-2">📌 Next steps</h3>
                <ul className="text-sm text-amber-800 space-y-1.5">
                  <li>• Send via certified mail with return receipt for a paper trail</li>
                  <li>• Keep a copy of this letter and all evidence</li>
                  <li>• Follow up if you don&apos;t hear back within 30 days</li>
                  <li>• This is AI-generated guidance — consult a lawyer for legal advice</li>
                </ul>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/"
                className="text-slate-500 hover:text-slate-700 text-sm underline underline-offset-2"
              >
                Start a new dispute
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
