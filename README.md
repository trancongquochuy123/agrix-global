# AGRIX — Agricultural Real-World Asset Platform (frontend prototype)

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Radix UI primitives · Recharts · React Leaflet · Framer Motion. Local mock data only.

```bash
npm install
npm run dev      # http://localhost:3000  (redirects / → /dashboard)
npm run build    # production build
npm run typecheck
```

Routes: `/dashboard`, `/marketplace`, `/marketplace/[slug]` (all six assets; `dak-lak-coffee-estate` is the reference), `/assets/register`, `/ai-intelligence`, `/portfolio`.

Notes
- Maps use free Esri World Imagery / OpenStreetMap tiles (no API key). Leaflet components are client-only (`components/maps`).
- Cover photos are remote URLs in `data/images.ts`; if one fails, `<SafeImage>` falls back to a designed placeholder. Swap URLs there.
- TypeScript is pinned to 5.9 (Next 15 cannot read tsconfig path aliases with TypeScript 7).
- The registration form autosaves a draft to `localStorage`.

## Interactive demo (frontend-only)

This is a clickable prototype. All data is mock, stored in the browser (`localStorage`, key `agrix:demo:v1`). No backend, payments, KYC or real authentication.

- Demo accounts (any password): `investor@agrix.demo`, `seller@agrix.demo`, `admin@agrix.demo`.
- Flow: Seller creates an asset → Admin approves → Investor invests → portfolio, seller funding and admin transactions update.
- `NEXT_PUBLIC_DEMO_MODE=true` shows the floating **Demo** button (switch workspace, load scenario, reset data) and the wizard's "Fill sample data". Unset or any other value renders neither. It is a build-time variable, so rebuild after changing it (see `.env.example`; on Vercel set it in Project Settings → Environment Variables).

## Bilingual interface (Tiếng Việt / English)

Every page has a **VI | EN** switch in the header (public site, role workspaces and `public/landing.html`). Switching is instant (no reload) and the choice is saved in `localStorage` under `agrix:lang` (shared by the landing page and the app), so it survives navigation, reloads and is synced across open tabs. First-time visitors get Vietnamese when their browser language is Vietnamese, otherwise English.

- `lib/i18n/core.ts`: language store and `translate()`. English source text is the key; missing entries fall back to English.
- `lib/i18n/react.tsx`: `useT()` / `useLang()` hooks. Use `const t = useT();` then `t("Log in")` or `t("{n} months", { n })`.
- `lib/i18n/dict/*.ts`: the Vietnamese dictionary, split by area (`common`, `pages`, `forms`, `messages`, `content`). Add a key with the exact English text used in the code.
- Notifications, activity entries and errors created by the demo store stay in English in storage; templates such as `"{name} is published"` translate them at display time. Dates follow the selected language; money keeps the `$1,000` notation in both languages (it matches the number format the forms accept).
- `app/layout.tsx` hides the pre-rendered English page until the stored language is applied, so Vietnamese readers never see an English flash.
- `public/landing.html` has its own small translator (block `agrix-i18n`) and self-hosted Vietnamese font subsets in `public/fonts` (Manrope Vietnamese + Be Vietnam Pro for body copy, since the embedded DM Sans has no Vietnamese glyphs).
- `npm run test:unit` includes `tests/unit/i18n.test.cjs` (pattern translation, dates, and a check that every Vietnamese entry keeps the placeholders of its English key).
