import { Leaf } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

type NordlyMarkProps = {
  className?: string
  iconSize?: number
}

export function NordlyMark({ className, iconSize = 26 }: NordlyMarkProps) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full bg-[#168bb4] text-white shadow-sm shadow-sky-950/10",
        className
      )}
      aria-hidden="true"
    >
      <Leaf size={iconSize} weight="bold" />
    </div>
  )
}
