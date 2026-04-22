export type PremiumModalContext =
  | "insight"
  | "analytics"
  | "equipment"
  | "reporting"
  | "general"

type PremiumModalContent = {
  title: string
  description: string
  contextMessage: string
  bullets: string[]
  primaryCta: string
  secondaryCta: string
  tertiaryCta: string
  microcopy: string
}

const SHARED_BULLETS = [
  "Equipment-based insights",
  "More accurate savings estimates",
  "Advanced analytics",
  "ROI visibility",
]

const BASE_DESCRIPTION =
  "Get deeper energy intelligence, more accurate savings estimates, and advanced features tailored to your operations."

export function getPremiumModalContent(context: PremiumModalContext): PremiumModalContent {
  if (context === "insight") {
    return {
      title: "Unlock Premium",
      description: BASE_DESCRIPTION,
      contextMessage:
        "This insight is available on Premium. Add equipment and unlock more specific, higher-value recommendations for your locations.",
      bullets: SHARED_BULLETS,
      primaryCta: "Upgrade now",
      secondaryCta: "Maybe later",
      tertiaryCta: "Learn more",
      microcopy: "No commitment. Upgrade anytime.",
    }
  }

  if (context === "analytics") {
    return {
      title: "Unlock Premium",
      description: BASE_DESCRIPTION,
      contextMessage:
        "Advanced analytics are available on Premium. See deeper savings visibility, richer performance tracking, and clearer ROI across your operations.",
      bullets: SHARED_BULLETS,
      primaryCta: "Upgrade now",
      secondaryCta: "Maybe later",
      tertiaryCta: "Learn more",
      microcopy: "No commitment. Upgrade anytime.",
    }
  }

  return {
    title: "Unlock Premium",
    description: BASE_DESCRIPTION,
    contextMessage:
      "Premium unlocks deeper insights, stronger savings intelligence, and better decision support across your workspace.",
    bullets: SHARED_BULLETS,
    primaryCta: "Upgrade now",
    secondaryCta: "Maybe later",
    tertiaryCta: "Learn more",
    microcopy: "No commitment. Upgrade anytime.",
  }
}
