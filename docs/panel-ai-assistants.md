# Panel AI: Nexxa parity and the per-profile tool matrix (2026-10)

The engine lives in backend `Lib/ai/copilot/*` (registry, engine, profiles, tools) and is mounted at `/api/v1/ai`. The UI lives in frontend `Components/Ai/*`. Each profile has its own prompt and page list (`Lib/ai/copilot/profiles.ts`), and its own chips and intro (`Components/Ai/Copilot/copilotProfiles.ts`). A tool shows up only when the tool's ACL action, plan module and admin permission all pass for this user. Reads call the normal endpoint handler in-process with the user's own request. Writes return a confirmation card, and the browser sends it to the normal endpoint after the user confirms.

## Nexxa AI → NoyanAI

| Nexxa (src/…) | What it does | NoyanAI |
|---|---|---|
| `lib/ai.ts` `aiChatDiag`, `isAiConfigured`, per-feature model, token quota | OpenAI-compatible call with error hints and a company token quota | `Lib/aiSettings.ts` `aiComplete` (existing). Every panel feature uses the **clinical** provider (in-country Ollama by default). The quota is per user per day (`AppConfig.panelAiDailyLimit`, `Models/PanelAiUsage.ts`, counted by feature, shown in System settings → AI). Patients use their own free/Pro limit (`Lib/patientPro.ts`). |
| `app/(app)/assistant` + `api/assistant` | Business Q&A chat over a data snapshot | «دستیار نویان» per profile. Questions get a short answer. A data question is answered by a read tool whose data comes from the endpoint (`finance_overview`, `center_occupancy`, `admin_stats`…). |
| `crm/copilot` + `api/ai/insight kind=copilot` | "Today's action plan" over stale leads, proposals, calls | `crm_action_plan` tool and `POST /ai/:name/crm/plan` (`Services/panelAiFeatures.ts crmActionPlan`): overdue follow-ups, recent no-shows, recall candidates. Clinics have no sales leads, so the inputs are patients. |
| `api/ai/insight kind=contact / lead` | One contact's analysis and a follow-up draft | `crm_contact_insight` tool and `POST /ai/:name/crm/contact/:id/insight`. No UI on the contact page yet; the CRM-parity agent can add a button that calls the endpoint. |
| `api/ai/insight kind=chat` | Summarize a team chat | Doctor–patient chat: summary plus 3 reply suggestions (`ChatAiSuggest`, `POST /ai/doctor/chat/:id/suggest`). A suggestion only fills the input. |
| `api/ai/campaign` | SMS / email marketing text from a brief | «نوشتن با هوش مصنوعی» in the SMS template form (`CrmAiWrite`, `POST /ai/:name/crm/template`), and the `crm_draft_template` tool, which goes through a confirmation card and saves a draft. Noyan's template approval is unchanged. Email is not ported (NoyanAI's CRM is SMS only). |
| `lib/call-ai.ts analyzeCallCore` | Call transcript → summary, sentiment, objections, quality, coaching, next action | `call_analyze` tool and `POST /ai/:name/call/analyze`. Input is an uploaded audio file or a recording on speaker; STT runs, then the analysis. Fields are re-aimed at a practice: reason, requests, urgency flag (emergency signs), handling quality, improvements, next action, follow-up text. One click turns the follow-up into a confirmed CRM follow-up. Nothing is stored. |
| `lib/call-ai.ts recommendProductsForCallCore` | Suggest catalogue products to pre-invoice from a call | Not ported. Proposing products to patients from a call would be selling medicine to patients, so it is left out on purpose. The pharmacy gets `purchase_draft` from reorder suggestions instead. |
| `crm/calls/studio` (TTS sales script / voice bot) | Generated sales script read out by TTS | Not ported. There is no TTS provider in NoyanAI, and an outbound voice sales bot to patients is not appropriate for a practice. Inbound call analysis covers the useful part. |
| `api/ai/ocr`, `journal`, `payslip`, insight finance kinds | Receipt OCR, journal drafts, payslip and finance insight | Finance agent (`Lib/business/financeAi.ts`). Its `financeCopilotTools` load into the registry automatically (`loadExternalTools`): `finance_profit_and_loss`, `finance_top_expenses`, `finance_receivables_aging`, `finance_insurer_balances`, `finance_cash_position`, `finance_cheques_due`, `finance_income_breakdown`, `finance_overdue_invoices`, `finance_monthly_trend`, `finance_cash_forecast`, `finance_anomalies`, `finance_draft_entry`. Verified loading in the pharmacy panel. |

## Tool matrix (✓ = registered for the profile; it shows only when its ACL action and module pass)

| Tool | kind | ACL / module | doctor | clinic | hospital | pharmacy | paraClinic | insurance | user | admin |
|---|---|---|---|---|---|---|---|---|---|---|
| navigate (profile pages) | nav | none | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| today_schedule | read | readSchedule / schedule | ✓ | | | | | | | |
| find_patient, open_patient | read/nav | readPatients, readPatient / patients | ✓ | | | | | | | |
| patient_summary | read | owner / patients | ✓ | | | | | | | |
| book_appointment → POST /doctor/desk/reservation | write | mutateCalendar / schedule | ✓ | | | | | | | |
| reschedule_appointment → POST /doctor/reservation/:id/move | write | mutateCalendar / schedule | ✓ | | | | | | | |
| write_prescription → opens the writer with ?rx= | nav | owner / drugsAndPrescriptions | ✓ | | | | | | | |
| center_doctors | read | owner | | ✓ | ✓ | | | | | |
| center_agenda (all doctors, one day) | read | readReservations | | ✓ | ✓ | | | | | |
| center_occupancy (30-day trend + reading) | read | none | | ✓ | ✓ | | | | | |
| pharmacy_queue (paid orders not shipped) | read | readOrders / incomingOrders | | | | ✓ | | | | |
| lab_orders (waiting for results) | read | readOrders / incomingOrders | | | | | ✓ | | | |
| insurer_plans | read | managePlans | | | | | | ✓ | | |
| insurer_network | read | readNetwork | | | | | | ✓ | | |
| inventory_alerts (low, expired, near expiry, reorder) | read | readInventory / inventory | | ✓ | ✓ | ✓ | ✓ | | | |
| purchase_draft → POST /<p>/inv/purchases | write | manageInventory / inventory | | ✓ | ✓ | ✓ | ✓ | | | |
| insurance_claims | read | readFinance / accounting | ✓ | ✓ | ✓ | ✓ | ✓ | | | |
| payroll_status | read | readPayroll / payroll | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| finance_overview | read | readFinance / accounting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| finance_draft_expense → POST /<p>/biz/finance/expenses | write | manageAccounting / accounting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| finance_* (finance agent, 12 tools) | read/write | readFinance / manageAccounting, accounting | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| crm_find_contact, crm_followups_due | read | readCrm / crm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| crm_create_followup → POST /<p>/crm/followups | write | manageCrm / crm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| crm_draft_template → POST /<p>/crm/templates | write | manageCrm / crm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| crm_action_plan, crm_contact_insight | read | readCrm / crm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| call_analyze | read | readCrm / crm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | |
| my_bookings, my_instructions, my_orders, my_wallet, my_pro | read | own data | | | | | | | ✓ | |
| health_question → /wizard (existing health assistant) | nav | none | | | | | | | ✓ | |
| admin_stats | read | role admin | | | | | | | | ✓ |
| admin_requests (/requests queue) | read | staff; the handler filters by AccessLevel | | | | | | | | ✓ |
| admin_find_user | read | AccessLevel User.readAll | | | | | | | | ✓ |
| admin_finance (platform books) | read | AccessLevel Finance.readAll | | | | | | | | ✓ |

The secretary profile works inside the org panels she was given (via the ACL cookie) with her own ACL, so she sees a subset. Her own home `/secretarypanel` shows no assistant.

Gaps worth knowing: there is no insurer-side claims review API, so the insurer gets plans, network, members and finance. The pharmacy Rx queue covers paid orders; the Tamin prescription queue is locked by the Tamin lockout.

## Registry contract for other modules

`registerCopilotTool({ name, profiles, kind, description, args, schema, acl, module, adminPermission, run(ctx, args) → Card })` from `Lib/ai/copilot/registry.ts`. Alternatively, export `financeCopilotTools` (array) or `registerCopilotTools(register)` from `Lib/business/financeAi.ts`. A tool that returns a string becomes an insight card, and `{fields, request}` becomes a confirmation card. Card shapes are in `Lib/ai/copilot/types.ts`.
