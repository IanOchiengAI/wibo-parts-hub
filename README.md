# WIBO — Genuine Auto Parts

Your trusted source for genuine auto parts in Kenya. Search by vehicle, get fitment guarantees, and pay with M-Pesa.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, storage, edge functions)
- TanStack Query

## Getting started

```sh
npm install
npm run dev
```

App runs at `http://localhost:8080`.

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

## Boni AI (Edge Function)

The Boni AI chat requires a deployed Supabase Edge Function and an Anthropic API key:

```sh
supabase link --project-ref <your-project-ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy boni-chat
```

Until deployed, the chat falls back to a WhatsApp prompt.

## Build

```sh
npm run build
```

## Contact info

Update `src/config/site.ts` with the real phone number and email before deploying.
