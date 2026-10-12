# Runbook

## Login (Google and Facebook)

Users sign in only through Google or Facebook (Supabase Auth, OAuth). On their first login they land on /onboarding and choose client ("I want to book creatives") or creative, plus name and city. That creates their row in `profiles`.

Flow: /login or /signup -> `signInWithSocial` (app/login/actions.ts) -> Google/Facebook -> Supabase -> /auth/callback (exchanges the code for a session) -> /onboarding if there's no profile yet, otherwise back to `next`.

### One-time setup

1. **Supabase project** (free tier, region Mumbai). Copy Project URL and the publishable key into `.env.local` and Vercel (see `.env.example`). Then:
   ```
   npx supabase login
   npx supabase link --project-ref <ref>
   npm run db:push && npm run db:types
   ```
2. **Allowed redirect URLs**: Supabase > Authentication > URL Configuration.
   - Site URL: the production URL.
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://<prod-domain>/auth/callback`, `https://*-<vercel-team>.vercel.app/auth/callback` (previews).
3. **Google**: Google Cloud Console > APIs & Services.
   - OAuth consent screen: External, app name "Trial App", scopes `email`, `profile`, `openid`.
   - Credentials > Create OAuth client ID > Web application. Authorized redirect URI: `https://<ref>.supabase.co/auth/v1/callback`.
   - Paste the Client ID and secret into Supabase > Authentication > Sign In / Providers > Google, and enable it.
4. **Facebook**: developers.facebook.com > Create app > "Authenticate and request data from users with Facebook Login".
   - Facebook Login > Settings > Valid OAuth Redirect URIs: `https://<ref>.supabase.co/auth/v1/callback`.
   - Use cases > permissions: add `email`.
   - Paste the App ID and App secret into Supabase > Providers > Facebook, and enable it.
   - The app stays in Development mode (only you and listed testers can log in) until you switch it to Live, which needs a privacy policy URL.

### Adding another provider

Supabase supports more (Apple, GitHub, X, LinkedIn...). Add it to `PROVIDERS` in lib/validation.ts and add a button in components/auth/social-buttons.tsx, then enable it in the dashboard. Apple needs a paid Apple Developer account, so it's out for now (free tiers only).
