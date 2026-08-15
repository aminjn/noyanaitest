# NoyanAI — Remaining Work

Draft v1, from full repo read on 2026-08-15.

Note: Tamin sandbox ≠ real API — all Tamin integration gets rewritten once real access lands. Not tracking granular Tamin tasks here for that reason.

---

## Immediate / Priority

- [ ] Tamin physio: frontend UI
- [ ] Tamin physio: backend logic
- [ ] Public pages: responsive (Figma)
- [ ] Redo blogs list (Figma)
- [ ] Redo blog post page (Figma)
- [ ] Redo home page (Figma)
- [ ] Analytics: backend tracking endpoint
- [ ] Analytics: server-managed cookie
- [ ] Analytics: mountable client component
- [ ] Analytics: wire into public pages
- [ ] Meta manager: title/description system
- [ ] Meta manager: schema.org markup
- [ ] Meta manager: wire list pages
- [ ] Meta manager: wire detail pages
- [ ] Deep-dive each panel's tasks

---

## FRONTEND

### Public

- [ ] Onboarding: wire CTA button
- [ ] Onboarding: define registration flow
- [ ] Onboarding: replace Figma CDN images
- [ ] Onboarding: CSS/design pass
- [ ] Cart: build line items
- [ ] Cart: build totals/checkout
- [ ] Book page: remove dead code

### Panel: Admin

- [ ] No action this pass

### Panel: Doctor

- [ ] Build home dashboard
- [ ] Build article page
- [ ] Build chat page
- [ ] Build discount page
- [ ] Build document page
- [ ] Build license page
- [ ] Build offer page
- [ ] Build finance page
- [ ] Migrate prescription edit to v2
- [ ] Migrate prescription print to v2
- [ ] Style prescription print PDF

### Panel: User (dashboard)

- [ ] Build booking detail UI

### Panel: Secretary

- [ ] Build home dashboard
- [ ] Add paraClinic boss page

### Panel: Clinic

- [ ] Build home dashboard
- [ ] Build calendar/scheduling
- [ ] Build shift management
- [ ] Build patient records
- [ ] Build office management
- [ ] Build clinic profile/settings
- [ ] Build finance page
- [ ] Build insurance/pharmacy affiliation

### Panel: Insurance

- [ ] Build home dashboard
- [ ] Define insurance business features
- [ ] Build claims review
- [ ] Build plan management
- [ ] Build doctor network view

### Panel: Pharmacy

- [ ] Build home dashboard

### Panel: ParaClinic

- [ ] Build home dashboard
- [ ] Build secretary management page
- [ ] Build patient records
- [ ] Build calendar/shift pages
- [ ] Build profile/settings pages

### Panel: Hospital

- [ ] Decide: self-service panel?
- [ ] Build hospital panel (if yes)

---

## BACKEND

### Domain: Doctor

- [ ] Fix session-type validation
- [ ] Add phone validator
- [ ] Link symptoms to records
- [ ] Add file attachments
- [ ] Optimize drug search query
- [ ] Refactor prescription edit logic
- [ ] Remove leftover debug log

### Domain: Clinic

- [ ] Scope clinic-specific endpoints

### Domain: Secretary / ACL

- [ ] Add hospital support (if decided)

### Domain: Insurance

- [ ] Spec insurance business logic
- [ ] Build claims endpoints
- [ ] Build plan management endpoints

### Domain: Pharmacy

- [ ] No action found

### Domain: ParaClinic

- [ ] Add patient-management endpoints
- [ ] (Physio logic moved to Immediate)

### Domain: Hospital

- [ ] Build hospital controller/router
- [ ] Wire owner field logic
- [ ] Add to ACL/RBAC systems

### Domain: User

- [ ] Add invoice pagination
- [ ] Add booking pagination

### Cross-cutting

- [ ] Finish prescription v2 migration
- [ ] Retire prescription v1
- [ ] Implement payment settlement
- [ ] Resolve telephony test endpoints
- [ ] Delete leftover SIP config
- [ ] Fix Offer owner list
- [ ] Add upload file filter
- [ ] Auto-fill blog author
- [ ] Build related-posts feature
- [ ] Fix availability race condition
- [ ] Fix timezone shift bug

---

## Open Questions

- [ ] Hospital: self-service or admin-only?
- [ ] Insurance: what features needed?
- [ ] Clinic: manage staff/departments?
- [ ] Onboarding: splash or full form?
- [ ] Prescription: retire v1 fully?
