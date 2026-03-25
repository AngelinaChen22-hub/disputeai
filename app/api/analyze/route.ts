import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

type DisputeType = "parking" | "credit-card" | "insurance";

// ─── Simple in-memory rate limiting ────────────────────────────────────────
// 5 requests per IP per hour. Replace with Upstash/Redis before going public.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 5;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= max) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfterSecs: 0 };
}

// ─── System prompts ─────────────────────────────────────────────────────────
const systemPrompts: Record<DisputeType, string> = {
  parking: `You are an expert at writing professional parking ticket appeal letters.
You write clear, factual, and persuasive letters that cite relevant regulations and dispute processes.
Your letters are firm but polite, and focus on the specific facts and evidence that support dismissal of the ticket.`,

  "credit-card": `You are an expert at writing professional credit card dispute and chargeback letters.
You are familiar with consumer protection laws (Fair Credit Billing Act, Regulation Z) and write letters that clearly invoke these protections.
Your letters are precise, professional, and include all necessary information for the bank to process a chargeback.`,

  insurance: `You are an expert at writing professional insurance claim appeal letters.
You understand insurance policy language, coverage disputes, and the appeals process.
Your letters reference policy terms, relevant state regulations, and clearly articulate why the claim should be approved or the settlement increased.`,
};

// ─── Style instructions injected into the prompt ────────────────────────────
const toneInstructions: Record<string, string> = {
  professional: "Write in a formal, professional tone — measured, precise, and businesslike.",
  assertive:
    "Write in a direct, assertive tone — confident and firm, making clear you know your rights and will escalate if necessary.",
  friendly:
    "Write in a firm but friendly tone — respectful and cooperative, but unambiguous about what you expect.",
};

const lengthInstructions: Record<string, string> = {
  brief:
    "Keep the letter concise — no more than one page. State the key facts and demand only; cut everything else.",
  standard: "Write a standard-length letter that covers all key points without being excessive.",
  detailed:
    "Write a comprehensive letter — include all relevant details, evidence specifics, prior contacts, and legal references. Thoroughness is more important than brevity.",
};

const emphasisInstructions: Record<string, string> = {
  evidence:
    "Emphasize the evidence heavily — dedicate significant space to describing and referencing each piece of evidence and what it proves.",
  legal:
    "Emphasize applicable laws, regulations, and consumer protections — cite specific statutes or rules where relevant.",
  outcome:
    "Focus on the desired outcome — make the demand and its reasonableness the central theme, returning to it throughout the letter.",
};

const maxTokensByLength: Record<string, number> = {
  brief: 800,
  standard: 2048,
  detailed: 3500,
};

function buildPrompt(disputeType: DisputeType, form: Record<string, string>): string {
  const tone = form.tone || "professional";
  const length = form.length || "standard";
  const emphasis = form.emphasis || "legal";

  return `Please write a professional dispute letter based on the following information:

Dispute Type: ${disputeType.replace("-", " ").toUpperCase()}
Date of Incident: ${form.date}
Amount in Dispute: ${form.amount || "not specified"}
Counterparty: ${form.counterparty}
Location/Reference: ${form.location || "not provided"}

Summary of what happened:
${form.summary}

Detailed explanation:
${form.details}

Evidence available:
${form.evidence || "None specified"}

Prior contact attempts:
${form.priorContact || "None"}

Desired outcome:
${form.desiredOutcome}

---

Letter style instructions (follow these carefully):
- Tone: ${toneInstructions[tone]}
- Length: ${lengthInstructions[length]}
- Emphasis: ${emphasisInstructions[emphasis]}

---

Write a complete dispute letter following the style instructions above. The letter should:
1. Have a proper header with today's date (${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}) and addressing
2. Clearly state the dispute and relevant facts
3. Reference any applicable regulations or consumer protections
4. Present the evidence persuasively
5. Make a clear and specific demand
6. End with a professional closing

Write the full letter text only — no commentary, no explanation before or after the letter.`;
}

// ─── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, retryAfterSecs } = checkRateLimit(ip);
  if (!allowed) {
    const mins = Math.ceil(retryAfterSecs / 60);
    return NextResponse.json(
      { error: `Too many requests. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429, headers: { "Retry-After": String(retryAfterSecs) } }
    );
  }

  try {
    const { disputeType, form } = await req.json();

    if (!disputeType || !form) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["parking", "credit-card", "insurance"].includes(disputeType)) {
      return NextResponse.json({ error: "Invalid dispute type" }, { status: 400 });
    }

    // Start streaming from Claude
    const maxTokens = maxTokensByLength[form.length || "standard"] ?? 2048;
    const stream = client.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system: systemPrompts[disputeType as DisputeType],
      messages: [
        {
          role: "user",
          content: buildPrompt(disputeType as DisputeType, form),
        },
      ],
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering if applicable
      },
    });
  } catch (error: unknown) {
    console.error("API error:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Invalid API key — check your ANTHROPIC_API_KEY in .env.local" },
        { status: 401 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Anthropic rate limit reached — please try again in a moment" },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `API error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to generate letter" }, { status: 500 });
  }
}
