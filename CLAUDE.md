# NoyanAI: project rules

Frontend (Next.js 14) of NoyanAI. The backend is `aminjn/noyanaitest-back`, which has the same rules.

## 1. Benchmark against the market leaders first (required)

Before you design or build a feature, a page, or a UX flow, check how the leaders in this market handle it:

| Area | Reference products |
|---|---|
| Booking and doctor discovery | Doctolib, Zocdoc, Docplanner (Doctoralia), Practo |
| Doctor-side practice management | Doctolib Pro, Docplanner / Doctoralia Pro, Practo Ray |
| Telemedicine | Teladoc, Amazon One Medical, K Health, Hims & Hers |
| AI triage and symptom checking | Ada Health, K Health (and Babylon, as the failure case) |
| One app for pharmacy, lab and insurance | Halodoc, Vezeeta, Altibbi, Seha / Sehhaty |
| Iranian market | Paziresh24, DrDr, Nobat, Doctoreto, SnappDoctor |

- Ground the comparison in the benchmark report (`docs/market-benchmark.md`). Research further when the report doesn't cover the case.
- In the PR or the reply, say in a few lines which pattern the leaders use and what NoyanAI copies, changes, or does better.
- Keep the Iranian context in mind: Tamin / Salamat e-prescription, SMS OTP, payments without international cards, and network restrictions.

## 2. Language and direction
- The site has 15 languages. Every user-visible text is a key in `Components/i18n/messages/*.json`: add it to all 15 files, to `Components/Enums/contentKeys.tsx`, and to the backend's `Models/TextContent.ts`.
- Never hardcode Persian or English text in components. Only admin pages (under `Components/Admin`) stay Persian-only.
- Persian, Arabic, and Urdu are RTL. Use logical CSS properties (`inline-start/end`, `text-align: start`), not physical `left/right`.
- Dates and numbers use `useIntlLocale()`; never hardcode `fa-IR` outside the admin panel.

## 3. Design and UI
- Check every page on both desktop (1440px) and mobile (390px) before you merge.
- Shared panel components are the source of truth. Improve them instead of adding one-off styles:
  - `Components/Layout/PanelLayout`, `PanelSidebar`
  - `Components/Admin/UI/Table`, `CreateForm`, `WithTitle`
  - `PopupCard`, `ClientTabSystem`
- Guard against bad data: a record missing a field, or a response that isn't an array, must not crash the page.

## 4. Fixed points
- The super admin panel path is `/notadmin` (`ADMIN_KEY=notadmin`). It is intentional: do not change it.
- Deploy with `bash /root/setup.sh` on the ArvanCloud server (`deploy/arvan/` in the backend repo).
- Before a PR: `npx tsc --noEmit` (the only known error is in `usePushNotifications.tsx`) and `npx next lint --quiet`.
