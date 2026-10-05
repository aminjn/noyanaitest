# NoyanAI accounting: Nexxa parity, adapted per profile

Paths are relative to a panel (`/doctorpanel`, `/clinicpanel`, `/hospitalpanel`, `/pharmacypanel`, `/paraClinicPanel`, `/insurancepanel`). Super admin: `/notadmin/finance/accounting` (platform book, same engine).
`A` = `finance/accounting?tab=…`, `T` = `finance/treasury?tab=…`, `S` = `finance/assets?tab=…`; `&view=` picks the sub-view. Every page lives in the «مالی و حسابداری» submenu.

Status: **done** = same capability. **adapted** = same capability, reshaped for healthcare or merged into a hub page (CLAUDE.md: one page per concern, parts as tabs). **skipped** = not built (reason given).

## 1. Nexxa page → NoyanAI page

| Nexxa page | NoyanAI page | Status | Note |
|---|---|---|---|
| accounting (dashboard) | `finance` (overview) + `A=summary` | adapted | Overview now opens with the profile tiles (AccProfilePanel), e.g. distributors/cheques/subsidy for a pharmacy |
| accounting/about | — | skipped | Marketing page, no function |
| account-groups | `A=accounts&view=group` | done | |
| total-accounts | `A=accounts&view=total` | done | |
| moein-accounts | `A=accounts&view=detail` | done | Plus tafsiliKinds, nature, permanent/temporary, active |
| accounts, accounts/[id] | `A=accounts&view=tree` + account popup | done | Tree with per-level create, edit, deactivate |
| tafsili | `A=parties&view=register` | done | BizParty: patient/supplier/insurer/person/doctor/bank/project/custom, code ranges, opening balance |
| phonebook | `A=parties&view=phonebook` | done | |
| statements, statements/[id] | `A=parties&view=statements` + `A=books&view=statements` | done | Party statement with opening/running balance, export/print |
| journal, journal/new, journal/[id]/edit | `A=journal` | done | Draft → final with audit trail, attachments, print, auto-balance, per-line party and centre |
| general-ledger | `A=books&view=moein` | done | Sub-ledger per account / party / centre |
| total-ledger | `A=books&view=total` | done | |
| treasury-ledger | `A=books&view=treasury` and `T=ledger` | done | |
| review | `A=books&view=review` | done | Tree drill-down group → total → detail → party |
| trial-balance | `A=trial` | done | Levels group/total/detail/party × 2/4/6/8 columns |
| reports | `A=statements` + `finance/reports` | adapted | Classified P&L and balance sheet with notes and period comparison; profile income tab first in reports |
| cash-flow | `A=statements&view=cash` | done | |
| cost-centers | `A=centers&view=report`/`tree` | done | Hierarchical, codes from 50001 |
| cost-allocation | `A=centers&view=allocation` | done | Percent rules, one voucher per run |
| budget | `A=budget` | done | Already existed; kept |
| tax | `A=tax&view=vat` | done | VAT-exempt drugs vs taxable cosmetics read from the chart |
| (169 seasonal lists) | `A=tax&view=seasonal` | done | Per-party purchases/sales per quarter, missing tax IDs flagged |
| moadian | `finance/moadian` | done | Existing module, untouched |
| fiscal-year | `A=years&view=years` | done | Closing grouped by account × party × centre; warns while drafts are open |
| (opening balances) | `A=years&view=opening` | done | Form or Excel/CSV import, one opening voucher balanced on 5103 |
| data-health | `A=health&view=health` | done | 14 checks (balanced, one-sided, postable, orphan, drafts, years, invoices, cheques, assets…) |
| calculator | `A=health&view=calculator` | done | |
| (audit log) | `A=health&view=audit` | done | create/update/finalize/revert/delete/attach/import with before/after |
| settings | `T=settings` | adapted | Negative-treasury policy (allow/warn/block), matching window |
| treasury | `T=accounts` | done | Cash, bank, petty; opening balance voucher |
| fund-transfers | `T=transfers` | done | Void = reversing voucher |
| remittances | `finance/payments` + request kind payment/remittance | adapted | Remittance is a payment method plus a request kind |
| receipts, receipts/new, receipts/[id] | `finance/payments` | adapted | Existing payments page; multi-invoice receipt allocation added (`/acc/allocate-receipt`) |
| payments, payments/new, payments/[id] | `finance/payments` + `finance/expenses` | adapted | Existing pages, party-tagged now |
| checks, checks/issued | `T=cheques&view=register` | done | Deposit, clear, bounce, endorse, undo last status |
| checks/trust | `T=cheques&view=trust` | done | No postings, tracked only |
| checkbooks | `T=cheques&view=books` | done | Leaves and used count; a cheque paid out picks its book and gets the next leaf, a used or out-of-range leaf is refused |
| bank-rec | `T=bank` | done | CSV/Excel import with column mapping, duplicate skip, auto-match, manual match, post-from-line, ignore |
| settlements | `T=settlements` (insurer menu: «تسویه با مراکز درمانی») | adapted | Receivables/payables by party with ageing; payables include cheques, claims payable, doctors' share |
| (claims received, insurer) | `finance/claims` (insurer menu: «مطالبات دریافتی از مراکز») | added | A centre's list sent to an insurer with a Noyan panel: line review (accept / deduct with reason / reject), one-way result with its date, full or on-account payment; both books post, the centre is notified |
| petty-cash-requests | `finance/requests` kind petty | done | |
| expense-requests | `finance/requests` kind expense | done | |
| payment-requests | `finance/requests` kind payment | done | |
| check-issue-requests | `finance/requests` kind checkIssue | done | |
| return-requests | `finance/requests` kind return | done | Credit note on execute |
| invoice-approvals | `finance/requests` kind invoice | adapted | One queue with an approval chain, not a separate page |
| invoices, invoices/new, [id], [id]/edit, print | `finance/invoices` | done | Existing invoices (patient/insurer split) |
| quick-invoice | `finance/invoices?view=quick` | done | Counter sale + receipt in one step |
| proforma, proforma/new | `finance/invoices?view=proforma` | done | Not posted until converted |
| price-list | `finance/invoices?view=prices` | adapted | Free price and insurance tariff per row |
| products, products/new, [id] | `finance/inventory` | adapted | Existing inventory; pharmacy items carry a class (drug/OTC/cosmetic) that picks stock, COGS and income accounts |
| purchases, new, [id], [id]/edit | `finance/inventory` purchases + `finance/expenses` | adapted | Existing purchase flow, supplier party on lines |
| expenses | `finance/expenses` | done | Existing |
| income | `finance/reports?tab=income` + `?tab=profile` | adapted | Income in the profile's own grouping |
| assets | `S=assets` | done | Purchase (cash/credit/opening), schedule |
| assets/groups | `S=groups` | done | Iranian tax presets (to be verified) |
| assets/depreciation | `S=depreciation` | done | One aggregated voucher per run, idempotent |
| assets/disposals | `S=disposals` | done | Gain/loss to 7216 |
| assets/transfers | `S=transfers` | done | |
| assets/maintenance | `S=maintenance` | done | |
| assets/revaluations | `S=revaluations` | done | Hidden for the doctor profile |
| assets/report | `S=report` | done | |
| reports/consolidated, reports/consolidated-cashflow | — | skipped | Consolidation: each NoyanAI owner is one legal entity; no group structure to consolidate |
| (multi-currency on cheques/invoices) | — | skipped | Iranian healthcare bills in toman only; foreign cards are unavailable |
| production (BOM, work orders) | — | skipped | No manufacturing in healthcare providers |
| anomalies, copilot, ocr, cash-forecast | `finance/ai` | skipped (other agent) | AI features belong to the finance-AI agent; the services below are callable for it |

## 2. Chart of accounts per profile

One engine, one template (`Lib/business/coa.ts`), filtered and renamed per kind by `chartFor(kind)`. Levels: group (1 digit) → کل (2) → معین (4); tafsili = BizParty on the line. Role codes stay stable; a role a profile lacks falls back through `ROLE_FALLBACK` (e.g. `otcIncome → salesIncome → otherIncome`), so any document posts somewhere. `ensureChart` only adds missing accounts and renames untouched system ones; it never deletes an account with postings.

| Profile | Own accounts added (code: name) | Core accounts renamed |
|---|---|---|
| Doctor (simple book) | 6113 online visit income, 6114 home visit, 6115 procedures, 7221 medical council dues, 7222 malpractice insurance, 7223 professional income tax | visit income → «درآمد ویزیت حضوری», rent → office rent, salaries → secretary and assistant, supplies → office consumables, noyanPending → due from NoyanAI |
| Clinic | 6115 procedures, 6116 surgery, 6117 imaging, 3305 doctors' share payable, 3306 inpatient deposits, 7105 doctors' fees, 7222, 7224 expired drugs | visit income → clinic visits, test income → laboratory, depreciation → medical equipment, inventory → drug stock |
| Hospital | as clinic (wards are cost centres; per-insurer receivables are parties on 1412) | visit → outpatient and emergency, inpatient → bed-days and hotel services |
| Pharmacy | 1603 OTC stock, 1604 cosmetics stock, 1420 subsidy receivable, 6118 OTC sales, 6119 cosmetics sales (VAT taxable), 6120 medical supplies sales, 6121 subsidy income, 7106 technical officer fee, 7224 expired drugs, 7302 OTC COGS, 7303 cosmetics COGS | inventory → drug stock, sales → drug sales (VAT exempt), COGS → drugs, payable → drug distributors, chequesPayable → cheques to distributors, insuranceReceivable → prescriptions' insurer share |
| Lab / imaging | 6117 imaging, 6122 haematology, 6123 biochemistry, 6124 microbiology and serology, 6125 pathology, 7106, 7222, 7224 | supplies → kits and reagents, suppliesExpense → kits used, labExpense → outsourced tests, maintenance → service contracts, equipment → lab and imaging equipment |
| Insurer | 1421 corporate contracts receivable, 1422 reinsurers, 3308 claims payable to providers, 3309 outstanding claims reserve, 6126 group premiums, 6128 reinsurers' share of claims, 7227 claims expense, 7228 reserve change, 7229 claim deductions, 7230 reinsurance premiums ceded | receivable → policyholders, premium → individual premiums, payable → creditors and providers |

Per-insurer, per-distributor and per-doctor balances are tafsili (parties) on one معین rather than one معین each, so a new insurer needs no chart change.

## 3. Menu and overview per profile

Menu order (`FINANCE_ORDER`, `Components/Layout/panelSections.tsx`):

| Profile | Finance submenu order | Overview tiles | Special entries (`/acc/profile/entries`) |
|---|---|---|---|
| Doctor | overview, wallet, invoices, payments, expenses, insurance, accounting, treasury, moadian, payroll, reports, ai | due from NoyanAI, patients, insurers, suppliers | none (simple book) |
| Clinic | overview, wallet, invoices, insurance, payments, expenses, accounting, treasury, assets, requests, inventory, payroll, moadian, reports, ai | insurers, doctors' share, deposits, suppliers | doctor's share, inpatient deposit, apply deposit |
| Hospital | same as clinic | insurers, doctors' share, deposits, drug stock | same as clinic |
| Pharmacy | overview, wallet, payments, **treasury (cheques)**, **inventory (expiry)**, insurance, invoices, expenses, accounting, assets, requests, moadian, payroll, reports, ai | **distributors, cheques issued, subsidy**, prescription insurers | price difference and subsidy |
| Lab / imaging | overview, wallet, invoices, insurance, payments, inventory, expenses, accounting, treasury, assets, requests, payroll, moadian, reports, ai | insurers, kits, suppliers, patients | none |
| Insurer | overview, **provider settlements**, payments, accounting, treasury, requests, expenses, invoices, wallet, payroll, moadian, reports, ai | **claims payable, reserve**, policyholders, corporate | premium, corporate contract, claim incurred, claim deductions, reserve (and release), provider payment |

The doctor has no assets or requests item in the menu, and asset revaluation is hidden for it. Production is never shown.
Reports open on the profile's own income tab: visit type (doctor), service type (clinic), ward/inpatient (hospital), drug class (pharmacy), lab section (lab), premium type (insurer).

## 4. Gap list (before → after)

| Area | Before | After |
|---|---|---|
| Chart | One flat template for everyone | Per-profile chart, 3 levels + tafsili, coding import, per-account rules |
| Tafsili | None (only free-text names) | BizParty on every voucher line, auto-tagged from invoices/expenses/claims/payments/purchases |
| Vouchers | Final only, edit = delete | Draft/final, approveVouchers permission, revert to draft, audit trail, attachments, print |
| Opening balances | None | Form + Excel/CSV import, party and treasury openings |
| Ledgers and trial | Trial balance only | Journal, general/sub-ledger, party and centre ledgers, review tree, trial 2/4/6/8 at 4 levels |
| Statements | P&L, balance sheet | Classified, with notes and period/year comparison; cash flow; Excel/CSV/print everywhere |
| Cost centres | Flat list | Tree, line-level centres, allocation rules |
| Fixed assets | None | Register, groups, depreciation, disposal, revaluation, transfer, maintenance, report |
| Treasury | Cash/bank only | Petty cash, transfers, bank fees, negative-balance policy, cheque deposit/endorse/undo, chequebooks, trust cheques |
| Bank reconciliation | None | Statement import, auto-match, manual match, post-from-line |
| Tax | VAT report | VAT + seasonal 169 lists |
| Requests | None | 7 request kinds, approval chain, one-way execution |
| Sales | Invoices | + quick invoice, proforma, price list, multi-invoice receipt allocation |
| Controls | None | Data health, audit log, calculator |
| Per profile | None | Chart, names, menu order, overview tiles, special entries, income grouping |
