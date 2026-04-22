"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { type EmailOtpType } from "@supabase/supabase-js"

import { NordlyMark } from "@/components/brand/NordlyMark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [notice, setNotice] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const noticeParam = params.get("notice")
    setNotice(noticeParam)

    const shouldImpersonate = params.get("impersonate") === "1"
    const tokenHash = params.get("token_hash")
    const verifyType = params.get("type") as EmailOtpType | null
    const nextPath = params.get("next")

    if (!shouldImpersonate || !tokenHash || !verifyType) {
      return
    }

    setIsImpersonating(true)
    setError(null)

    void (async () => {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: verifyType,
      })

      if (verifyError) {
        setError(verifyError.message)
        setIsImpersonating(false)
        return
      }

      const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : "/app"
      router.replace(redirectPath)
      router.refresh()
    })()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsSubmitting(false)
      return
    }

    router.push("/app")
    router.refresh()
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_0%_0%,#d9f0f7_0%,#f4f8fb_45%,#ffffff_100%)] px-6 py-16">
      <div className="pointer-events-none absolute -left-20 top-10 h-52 w-52 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

      <section className="relative z-10 w-full max-w-md rounded-xl border border-primary/10 bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-primary/20 bg-white/90 px-4 py-2 shadow-sm">
          <div className="nordly-logo-entrance">
            <NordlyMark />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-foreground">Nordly</p>
            <p className="text-xs text-muted-foreground">Welcome back</p>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Continue to your Nordly workspace.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isImpersonating ? (
            <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              Completing impersonation sign-in...
            </p>
          ) : null}

          {notice ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {notice}
            </p>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-800">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="nordly-gradient-button w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          New to Nordly?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
      </section>
    </main>
  )
}
