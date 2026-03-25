# ⚖️ DisputeAI

> AI-powered dispute resolution — generate professional dispute letters in minutes.

DisputeAI helps users fight back against unfair parking tickets, unauthorized credit card charges, and denied insurance claims. Describe your situation, and Claude AI drafts a persuasive, legally-informed letter tailored to your case — with real-time streaming, tone controls, and delivery guidance.

**Live site:** [disputeai.us](https://disputeai.us)

---

## ✨ Features

- **3 dispute types** — Parking tickets, credit card chargebacks, insurance claim appeals
- **4-step intake form** — Guided flow collecting all the context Claude needs
- **Real-time streaming** — Letter types out word-by-word as Claude generates it
- **Letter style controls** — Customize tone (Professional / Assertive / Friendly), length (Brief / Standard / Detailed), and emphasis (Evidence / Legal / Outcome-focused)
- **Tweak & Regenerate** — Adjust style and regenerate without starting over
- **Where to send** — Step-by-step delivery guidance with deadlines per dispute type
- **Copy & Download** — One-click copy or `.txt` download
- **Rate limiting** — In-memory rate limiting (5 requests/hour per IP)
- **Secure** — API key is server-side only, never exposed to the browser

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Anthropic Claude (`claude-sonnet-4-5`) via `@anthropic-ai/sdk` |
| Streaming | Server-Sent Events (SSE) via `ReadableStream` |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/disputeai.git
cd disputeai/web

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Open .env.local and add your Anthropic API key
```

### Environment Variables

Create a `.env.local` file in the `web/` directory:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> ⚠️ Never prefix with `NEXT_PUBLIC_` — this would expose the key to the browser.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
web/
├── app/
│   ├── page.tsx                      # Landing page (3 dispute type cards)
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Base styles
│   ├── dispute/[type]/
│   │   ├── page.tsx                  # Route + dispute type validation
│   │   └── DisputeFlow.tsx           # 4-step intake form (main UI)
│   └── api/analyze/
│       └── route.ts                  # Anthropic API route (server-side)
├── .env.local                        # Your API key (gitignored)
├── .env.local.example                # Template for env setup
└── package.json
```

---

## 🤖 AI Design

The API route (`app/api/analyze/route.ts`) calls Claude with:

- A **type-specific system prompt** (parking / credit card / insurance expert)
- A **structured user prompt** built from all form fields
- **Style instructions** injected from the user's tone / length / emphasis selections
- **Dynamic `max_tokens`** scaled by length setting (800 brief → 3500 detailed)
- **Streaming** via `client.messages.stream()` returning SSE chunks to the browser

```
Browser (DisputeFlow.tsx)
  → POST /api/analyze
    → route.ts (server)
      → Anthropic Claude API (streaming)
        → SSE chunks → letter types out in real time
```

---

## 🔒 Security

- API key is server-side only (never in client bundle)
- `.env.local` is gitignored
- Route is `POST` only with input validation
- In-memory rate limiting: 5 requests per IP per hour

---

## 🗺 Roadmap

### Phase 1 ✅ (Complete)
- [x] Landing page with 3 dispute types
- [x] 4-step intake form
- [x] AI letter generation via Claude API
- [x] Real-time streaming
- [x] Letter style controls (tone, length, emphasis)
- [x] Tweak & regenerate panel
- [x] Where to send guidance
- [x] Copy + download letter
- [x] Rate limiting

### Phase 2 (Next)
- [ ] Multi-agent pipeline (Analyzer → Route Finder → Writer → Action Planner)
- [ ] Case strength score (1–10) with reasoning
- [ ] Tool use — Claude searches for the real mailing address
- [ ] Letter feedback (thumbs up/down) for quality tracking
- [ ] User accounts + dispute history (Clerk auth)

### Phase 3 (Future)
- [ ] PDF generation for appeal letters
- [ ] Email sending directly from app
- [ ] Evidence photo upload (S3)
- [ ] iOS app (React Native / Expo)

---

## 📄 License

MIT — feel free to fork and build on this.

---

*Built with [Claude AI](https://anthropic.com) · Deployed on [Vercel](https://vercel.com)*
