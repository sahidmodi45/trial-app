@AGENTS.md

# Trial App

An "Urban Company for creative services" in India. Clients find and book creatives (photographers, videographers, editors, artists). Creatives list a profile and a portfolio. A client sends a booking request; the creative accepts or declines; once it is accepted, both see each other's phone number and a WhatsApp button. No payments, no chat.

## Stack

Next.js (App Router, TypeScript), Tailwind + shadcn/ui, Supabase (Postgres, Auth with email+password, Storage, RLS), Vercel (auto-deploys main), Supabase CLI via npx (migrations in supabase/migrations).

## Commands

npm run dev | build | lint | typecheck
npm run db:new -- <name>          create a migration file
npm run db:push                   apply new migrations to the linked Supabase project
npm run db:types                  regenerate lib/database.types.ts after any schema change
npm run seed:demo [-- --remove]   add or remove demo creatives (needs SUPABASE_SECRET_KEY in .env.local)

## Where things live

app/                  pages; each page's writes live in actions.ts next to it (Server Actions)
components/ui/        shadcn components; add with "npx shadcn@latest add <name>"; do not hand-edit
components/           app components grouped by feature (landing, creatives, bookings)
lib/supabase/         clients: client.ts (browser), server.ts (server), proxy.ts (session refresh)
lib/auth.ts           getUser / requireUser / requireProfile; use these to protect pages
lib/validation.ts     zod schemas for every form
lib/format.ts, storage.ts, whatsapp.ts, cities.ts, types.ts   helpers
supabase/migrations/  the database schema, in order
docs/                 ARCHITECTURE.md (how it works), RUNBOOK.md (how to operate it)

## Data (details in docs/ARCHITECTURE.md)

profiles (role client|creative, name, city), contact_details (phone, private), categories, creatives (one per creative: category, bio, price), portfolio_items (image paths), bookings (status pending|accepted|declined|cancelled).
Images: public bucket "media", path <user_id>/portfolio/<uuid>.webp. The DB stores paths; lib/storage.ts turns them into URLs.

## Security rules (enforced in the database; never rely on the UI alone)

- Every table has RLS on and explicit GRANTs in its migration. A new table without grants fails with "permission denied".
- Creatives, portfolios, categories and basic profiles are public. Users edit only their own data.
- Phone numbers live only in contact_details. They are visible to the owner, and to the other person on an ACCEPTED booking.
- Bookings are visible only to their client and creative. Status changes ONLY through the set_booking_status database function: the creative accepts or declines a pending booking; the client cancels a pending or accepted one.
- The secret key (SUPABASE_SECRET_KEY) is only for scripts/. Never import it in app/ or components/, and never prefix it NEXT_PUBLIC_.
- On the server, identify the user with lib/auth.ts (getClaims inside). Never trust getSession() on the server.

## Conventions

- Server Components by default. Add "use client" only for interactivity (uploads, buttons with a pending state).
- Reads happen in Server Components. Writes happen in Server Actions (actions.ts), which validate with zod, call Supabase, then revalidatePath or redirect.
- Schema changes: a NEW migration (npm run db:new) containing the table, RLS, policies and grants together; then db:push and db:types. Never edit an old migration. Never change tables in the Supabase dashboard.
- Mobile first: design at 375px wide, tap targets of 44px or more, single-column forms.
- Money is whole rupees (int), shown with formatINR. Dates are 'YYYY-MM-DD', shown with formatDate (IST).
- Phone numbers are stored as +91XXXXXXXXXX.
- Keep files small and names plain. Comment the why, not the what.
- Free tiers only. Do not add paid services, ORMs, state libraries or API routes.

## Definition of done (every change)

build, lint and typecheck pass; checked at 375px in the browser; tested on the Vercel preview on a phone; migration pushed and types regenerated if the schema changed; the Status section below updated if something significant changed.

## Git

One branch per change (git switch -c <name>/<task>) -> commit -> push -> gh pr create --fill -> test the preview URL -> merge. main deploys to production automatically.

## Status

Built: config, layout, header, footer, landing (hero and how-it-works are stubs).
Next: build Hero and HowItWorks.
