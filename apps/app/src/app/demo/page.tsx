import Link from "next/link"

const DEMO_ACCOUNTS = [
  {
    title: "Stockholm Retail Demo",
    company: "Stockholm Retail Group",
    email: "demo-retail@nordly.app",
    tier: "Free",
  },
  {
    title: "Stockholm Hotel Demo",
    company: "Aurora Stay Stockholm",
    email: "demo-hotel@nordly.app",
    tier: "Premium",
  },
  {
    title: "Stockholm Office Demo",
    company: "NorthPeak Offices Stockholm",
    email: "demo-office@nordly.app",
    tier: "Premium",
  },
]

export default function DemoAccessPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9f0f7_0%,#eef6fb_40%,#ffffff_100%)] px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Internal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Nordly Demo Access</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Use these Stockholm demo tenants for investor demos, customer walkthroughs, QA screenshots, and sales rehearsal.
            Login is done through the existing auth flow.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {DEMO_ACCOUNTS.map((account) => (
              <article key={account.email} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">{account.tier}</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{account.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{account.company}</p>
                <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-slate-700">{account.email}</p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Go To Login
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            For internal use only. If these accounts do not exist yet, run demo:seed with SUPABASE_SERVICE_ROLE_KEY.
          </div>
        </div>
      </div>
    </main>
  )
}
