# Logic audit of the super admin (2026-09-29)

Five read-only audits by the `logic-auditor` agent (`.claude/agents/logic-auditor.md`).
Each file lists every defect with file:line, what happens now, why it is wrong, the fix,
a severity (blocker / major / minor) and whether it needs a product decision.

| File | Scope |
|---|---|
| [doctor.md](doctor.md) | Doctors, specialities and speciality categories, services, doctor cards, become-doctor, doctor joins |
| [centers.md](centers.md) | Clinics, hospitals, paraclinics and tests, pharmacies, insurers, their categories/tags/additions and become-X flows |
| [content.md](content.md) | Diseases, symptoms, drugs, blog, FAQ, taxonomy, SEO (page meta, redirects, sitemap), translations, ads |
| [money.md](money.md) | Licenses, finance and tax settings, wallet, SEP, cart and orders, payouts and refunds |
| [ops.md](ops.md) | Users and access levels, alerts and SMS, tickets, comments, inbox, call rooms, geo data, dev/test pages |

## Fixed right after the audit
- Cart: a line's quantity can no longer go below 1 (a negative line lowered the order total and was refunded on cancel), quantities are bounded, and a bad legacy line blocks checkout.
- Doctor national ID (`DoctorProfile.ssid`) is no longer returned by any public endpoint.
- A generic comment can no longer be posted on a doctor (it reset the verified rating); one scored comment per user per item.
- Unpublished blog posts are no longer readable publicly.
- Pages without an SEO entry no longer carry the "Create Next App" title.
