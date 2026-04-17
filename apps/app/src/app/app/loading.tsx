export default function AppLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-10 w-64 rounded-xl bg-muted/50" />
          <div className="h-5 w-80 rounded-lg bg-muted/40" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              <div className="h-4 w-24 rounded bg-muted/40" />
              <div className="mt-3 h-8 w-28 rounded bg-muted/50" />
              <div className="mt-2 h-4 w-36 rounded bg-muted/30" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="h-6 w-40 rounded bg-muted/50" />
            <div className="mt-4 h-4 w-72 rounded bg-muted/40" />
            <div className="mt-2 h-4 w-64 rounded bg-muted/30" />
            <div className="mt-6 h-11 w-44 rounded-xl bg-muted/50" />
          </div>
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="h-6 w-40 rounded bg-muted/50" />
            <div className="mt-4 h-4 w-56 rounded bg-muted/40" />
            <div className="mt-2 h-4 w-52 rounded bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  )
}
