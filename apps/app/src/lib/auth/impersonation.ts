export const IMPERSONATION_COOKIE_NAME = "nordly_impersonation"

export type ImpersonationState = {
  companyName: string
  adminUserId: string
  adminEmail: string
  resumeLink: string
  startedAtIso: string
}

export function encodeImpersonationState(value: ImpersonationState): string {
  return encodeURIComponent(JSON.stringify(value))
}

export function decodeImpersonationState(rawValue: string | undefined): ImpersonationState | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<ImpersonationState>

    if (
      typeof parsed.companyName !== "string" ||
      typeof parsed.adminUserId !== "string" ||
      typeof parsed.adminEmail !== "string" ||
      typeof parsed.resumeLink !== "string" ||
      typeof parsed.startedAtIso !== "string"
    ) {
      return null
    }

    return {
      companyName: parsed.companyName,
      adminUserId: parsed.adminUserId,
      adminEmail: parsed.adminEmail,
      resumeLink: parsed.resumeLink,
      startedAtIso: parsed.startedAtIso,
    }
  } catch {
    return null
  }
}
