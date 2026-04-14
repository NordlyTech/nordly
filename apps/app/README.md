# Nordly App (Next.js SaaS)

This folder contains the SaaS application for Nordly, built with Next.js (App Router), TypeScript, Tailwind CSS, and ESLint.

## Run Locally

From this directory:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build and Start

```bash
npm run build
npm run start
```

## Deploy on Vercel

1. Import the repository into Vercel.
2. In Project Settings, set Root Directory to `apps/app`.
3. Keep Framework Preset as Next.js.
4. Use default build and output settings:
	- Build Command: `npm run build`
	- Install Command: `npm install`
	- Output: Next.js default
5. Deploy.

This app uses standard Next.js configuration (no custom server), so it is ready for Vercel deployment from `apps/app`.
