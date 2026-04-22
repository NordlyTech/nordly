import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Client } from "pg"

type DemoUserSpec = {
  email: string
  fullName: string
}

const DEMO_USERS: DemoUserSpec[] = [
  { email: "demo-retail@nordly.app", fullName: "Anna Retail Demo" },
  { email: "demo-hotel@nordly.app", fullName: "Erik Hotel Demo" },
  { email: "demo-office@nordly.app", fullName: "Sofia Office Demo" },
  { email: "demo-admin@nordly.app", fullName: "Nordly Demo Admin" },
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const APP_ROOT = path.resolve(__dirname, "..")
const SQL_PATH = path.join(APP_ROOT, "supabase", "seed_demo.sql")

function parseArgs() {
  const args = new Set(process.argv.slice(2))

  return {
    resetOnly: args.has("--reset"),
    seed: args.has("--seed") || !args.has("--reset"),
  }
}

function getEnv(name: string) {
  const value = process.env[name]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

async function ensureDemoAuthUsers() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL") ?? getEnv("VITE_SUPABASE_URL")
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("[demo-seed] Skipping auth user provisioning (missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).")
    console.log("[demo-seed] If users are missing, create these accounts first:")
    for (const user of DEMO_USERS) {
      console.log(`  - ${user.email} (${user.fullName})`)
    }
    return
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) {
    throw new Error(`[demo-seed] Failed to list auth users: ${listError.message}`)
  }

  const existingByEmail = new Map<string, string>()
  for (const user of listData.users ?? []) {
    if (user.email) {
      existingByEmail.set(user.email.toLowerCase(), user.id)
    }
  }

  const defaultPassword = getEnv("DEMO_USER_PASSWORD") ?? "NordlyDemo123!"

  for (const demoUser of DEMO_USERS) {
    const key = demoUser.email.toLowerCase()
    const existingId = existingByEmail.get(key)

    if (existingId) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingId, {
        user_metadata: {
          full_name: demoUser.fullName,
        },
      })

      if (updateError) {
        throw new Error(`[demo-seed] Failed to update user metadata for ${demoUser.email}: ${updateError.message}`)
      }

      console.log(`[demo-seed] Auth user exists: ${demoUser.email}`)
      continue
    }

    const { error: createError } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.fullName,
      },
    })

    if (createError) {
      throw new Error(`[demo-seed] Failed to create auth user ${demoUser.email}: ${createError.message}`)
    }

    console.log(`[demo-seed] Created auth user: ${demoUser.email}`)
  }
}

async function runSql(action: "seed" | "reset") {
  const databaseUrl = getEnv("SUPABASE_DB_URL") ?? getEnv("DATABASE_URL")
  if (!databaseUrl) {
    throw new Error(
      "Missing SUPABASE_DB_URL or DATABASE_URL. This script needs a direct Postgres connection string to execute SQL."
    )
  }

  const sql = await fs.readFile(SQL_PATH, "utf8")

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  await client.connect()

  try {
    await client.query("begin")
    await client.query(sql)

    if (action === "seed") {
      await client.query("select public.nordly_seed_demo_data()")
      console.log("[demo-seed] Seed completed.")
    } else {
      await client.query("select public.nordly_reset_demo_data()")
      console.log("[demo-seed] Reset completed.")
    }

    const { rows } = await client.query(
      `select name, subscription_tier
       from public.companies
       where name in ('Stockholm Retail Group', 'Aurora Stay Stockholm', 'NorthPeak Offices Stockholm')
       order by name asc`
    )

    console.log("[demo-seed] Demo companies in database:")
    for (const row of rows) {
      console.log(`  - ${row.name} (${row.subscription_tier})`)
    }

    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    await client.end()
  }
}

async function main() {
  const args = parseArgs()

  console.log("[demo-seed] Starting Nordly demo seed tooling...")

  if (args.seed && !args.resetOnly) {
    await ensureDemoAuthUsers()
    await runSql("seed")
    return
  }

  if (args.resetOnly) {
    await runSql("reset")
    return
  }

  await ensureDemoAuthUsers()
  await runSql("seed")
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[demo-seed] Failed: ${message}`)
  process.exitCode = 1
})
