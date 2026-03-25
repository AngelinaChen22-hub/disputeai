import Link from "next/link";

const disputeTypes = [
  {
    type: "parking",
    emoji: "🅿️",
    title: "Parking Ticket",
    description: "Contest unfair parking citations with a compelling, evidence-backed appeal letter.",
    examples: ["Wrong location", "Meter malfunction", "Sign obstruction"],
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    type: "credit-card",
    emoji: "💳",
    title: "Credit Card Dispute",
    description: "Dispute fraudulent charges or billing errors with a professional chargeback letter.",
    examples: ["Unauthorized charge", "Duplicate billing", "Item not received"],
    color: "from-violet-500 to-violet-600",
    bgLight: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    type: "insurance",
    emoji: "🛡️",
    title: "Insurance Claim",
    description: "Appeal denied or underpaid insurance claims with a detailed, professional letter.",
    examples: ["Claim denied", "Low settlement", "Coverage dispute"],
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="text-xl font-bold text-slate-900">DisputeAI</span>
          </div>
          <span className="text-sm text-slate-500">AI-powered dispute resolution</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block"></span>
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
          Fight back with the power<br className="hidden sm:block" /> of AI
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Generate professional dispute letters in minutes. DisputeAI analyzes your situation
          and crafts persuasive, legally-informed letters that get results.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <span>✅ Free to use</span>
          <span>✅ Takes 2 minutes</span>
          <span>✅ Professional quality</span>
        </div>
      </section>

      {/* Dispute Type Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">
          Choose your dispute type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {disputeTypes.map((d) => (
            <Link
              key={d.type}
              href={`/dispute/${d.type}`}
              className={`group relative rounded-2xl border ${d.border} ${d.bgLight} p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl shadow-sm`}>
                  {d.emoji}
                </div>
                <span className="text-slate-300 group-hover:text-slate-400 transition-colors text-xl mt-1">→</span>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{d.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{d.description}</p>
              </div>

              {/* Examples */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {d.examples.map((ex) => (
                  <span key={ex} className={`text-xs font-medium px-2.5 py-1 rounded-full ${d.badge}`}>
                    {ex}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className={`mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${d.color} text-white text-sm font-semibold text-center group-hover:opacity-90 transition-opacity`}>
                Start Dispute →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <p>DisputeAI — Not legal advice. For informational purposes only.</p>
      </footer>
    </main>
  );
}
