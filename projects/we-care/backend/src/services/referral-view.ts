export type ReferralViewType = "inbound" | "outbound" | "pending";

export const DEFAULT_REFERRAL_VIEW: ReferralViewType = "inbound";

export function normalizeReferralViewType(value: string | undefined): ReferralViewType {
  if (value === "inbound" || value === "outbound" || value === "pending") {
    return value;
  }

  return DEFAULT_REFERRAL_VIEW;
}
