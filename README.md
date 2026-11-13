# BRANDSCOPE

Where Brands Get Discovered.

BRANDSCOPE is a responsive business discovery and commercial publishing network. Businesses create their own profiles, catalogs, and updates; visitors can browse publicly and contact brands directly through WhatsApp or their official website.

Built and powered by [CHILL TECH LTD](https://chilltechltd.com).

## Current product model

- Business-only accounts with fast-track and corporate onboarding
- Public brand directory, industry categories, catalog pages, and brand updates
- Direct WhatsApp inquiries and ordering handoff
- Supabase email/password authentication, invitations, and password recovery
- Device photo upload with browser-side optimization
- Editorial verification and a protected administrator console
- Public post and product permalinks with canonical metadata and Schema.org data
- Dynamic sitemap for brands, products, posts, and categories
- USD is the catalog currency
- No advertising, billing, payment, or subscription system
- No seeded listings: member businesses publish their own content

## Technology

- React 18 and Vite
- React Router DOM 7
- Vanilla CSS in `src/styles/index.css`
- Lucide React icons
- Outfit headings and Inter body typography
- Supabase Auth, Postgres, Row Level Security, and Storage
- Vercel hosting and serverless sitemap generation

## Local setup

Requirements: Node.js 20 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Create `.env.local` manually and add `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_APP_URL`. Every `.env` variant is
ignored by Git; configure the same values privately in the Vercel dashboard.

Never place a Supabase secret or `service_role` key in a `VITE_` variable.
Every `VITE_` value is shipped to the browser. BRANDSCOPE uses only the
publishable browser key in frontend code; privileged keys remain server-only.

## Supabase database

The production schema is versioned in `supabase/migrations/`. It includes:

- profiles, brands, products, posts, comments, follows, likes, notifications, reports, verification requests, and audit logs
- explicit Data API grants and Row Level Security policies
- account-scoped public and private Storage policies
- Auth signup provisioning for profiles and first brand records
- private privileged functions with public security-invoker admin RPCs
- administrator allowlisting and audit events

To link and apply migrations with Supabase CLI v3:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push --remote --dry-run --yes
npx supabase db push --remote --yes
npx supabase db advisors --remote --type all --level warn
```

Authorized administrator emails:

- `chilltech2k26@gmail.com`
- `lamidiabdulhameedolawale@gmail.com`
- `lamidiabdulhameedolawale21@gmail.com`

Admin authorization is enforced by the database profile role, not by client-side email matching.

## Authentication

The application includes:

- sign up and sign in
- Remember Me session storage selection
- show/hide password controls
- email confirmation handling
- forgot-password email delivery
- invitation and recovery password setup
- protected brand dashboard and administrator routes

After deploying, set the Supabase Auth Site URL to the production Vercel/custom domain and add these redirect URLs:

```text
https://your-domain.example/auth/confirm
https://your-domain.example/set-password
```

Keep the localhost equivalents while developing.

## Search discovery

Public brand, post, and product pages include canonical metadata and structured data. Posts visibly state “Originally published on BRANDSCOPE,” and product pages display “Source: BRANDSCOPE.”

`/sitemap.xml` is generated at request time by `api/sitemap.js` and includes active brands, catalog items, published posts, categories, and public platform pages.

Search engines decide whether and when to index a URL; indexing cannot be guaranteed by an application. After deployment:

1. Add the production domain to Google Search Console.
2. Verify domain ownership using the real token or DNS record Google provides.
3. Submit `https://your-domain.example/sitemap.xml`.
4. Keep profiles and content public, useful, and original.

## Vercel deployment

Import the GitHub repository into Vercel and use the Vite defaults:

- Build command: `npm run build`
- Output directory: `dist`

Set these Vercel environment variables for Production, Preview, and Development as appropriate:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_APP_URL
SITE_URL
```

`VITE_APP_URL` and `SITE_URL` should be the final public origin, without a trailing slash. `vercel.json` provides SPA rewrites, the dynamic sitemap route, and baseline security headers.

## Verification

```bash
npm test
npm run build
npm audit
```

There is also a live Supabase integration suite that creates temporary accounts, verifies RLS and Storage isolation, and removes the test records afterward. Run it only with a server-side service role key in the current shell:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_server_only_key npm run test:integration
```

Do not commit that key or expose it in Vercel browser variables.

## Attribution

**BRANDSCOPE** — *Where Brands Get Discovered.*  
Built and powered by **CHILL TECH LTD**.
