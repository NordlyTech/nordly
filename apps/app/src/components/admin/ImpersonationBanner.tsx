import { WarningCircle } from "@phosphor-icons/react/dist/ssr"

import { exitImpersonationAction } from "@/app/admin/actions/impersonateUser"
import { Button } from "@/components/ui/button"

type ImpersonationBannerProps = {
  companyName: string
}

export function ImpersonationBanner({ companyName }: ImpersonationBannerProps) {
  return (
    <div className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-amber-950">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 text-sm md:text-[15px]">
        <p className="flex items-center gap-2 font-medium">
          <WarningCircle size={18} weight="fill" className="text-amber-700" />
          You are impersonating {companyName}
        </p>

        <form action={exitImpersonationAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-amber-500 bg-white text-amber-900 hover:bg-amber-50"
          >
            Exit impersonation
          </Button>
        </form>
      </div>
    </div>
  )
}
