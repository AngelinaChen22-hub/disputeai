import { notFound } from "next/navigation";
import DisputeFlow from "./DisputeFlow";

const VALID_TYPES = ["parking", "credit-card", "insurance"] as const;
type DisputeType = (typeof VALID_TYPES)[number];

const typeConfig: Record<DisputeType, { title: string; emoji: string; color: string }> = {
  parking: { title: "Parking Ticket", emoji: "🅿️", color: "blue" },
  "credit-card": { title: "Credit Card Dispute", emoji: "💳", color: "violet" },
  insurance: { title: "Insurance Claim", emoji: "🛡️", color: "emerald" },
};

export default function DisputePage({ params }: { params: { type: string } }) {
  if (!VALID_TYPES.includes(params.type as DisputeType)) {
    notFound();
  }

  const config = typeConfig[params.type as DisputeType];

  return <DisputeFlow disputeType={params.type as DisputeType} config={config} />;
}
