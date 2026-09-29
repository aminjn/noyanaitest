# NoyanAI logic audit: users, access and operations (super admin)

This was a read-only audit. No repo files were changed.
Scope: user, accesslevel, useraccesslevel, userAlert, notification, smsPatterns, ticket, contactRequest, comment, doctorFeedback, inbox, audit, analytics, callroom, tamin, cold/old/devtools, ollama, aiExample, pushTest, province/city/district, the dashboard and the sidebar.

Paths:
- FE = `/home/user/noyanaitest`
- BE = `/home/user/noyanaitest-back`

Severity scale: **blocker**, **major**, **minor**. "PD" means the fix needs a product decision.

---

## 0. Summary of the top defects

| # | Section | Defect | Sev |
|---|---|---|---|
| 1 | comment / doctorFeedback | Any logged-in user can reset a doctor's rating to 0. Two review systems both write `DoctorProfile.averageScore`. | blocker |
| 2 | inbox / requests | Pharmacy addition requests from doctors never reach the admin: no admin route, no page and no inbox entry. | major |
| 3 | tamin | All Tamin calls and reference-data syncs use the **sandbox** hosts (`ep-test`, `ap-test`, `account-pilot`) and hardcoded test IDs. | blocker (PD) |
| 4 | access levels | Access levels restrict only about 35 models. Tickets, comments, reviews, contact requests, notifications, geo, paraClinic and more are "full admin only". A support agent therefore has to be made super admin. The `Comment` and `DoctorSeretaryAccessLevel` toggles have no effect. | major (PD) |
| 5 | userAlert | Staff alerts, which carry requester phone numbers, go to any user who has a `UserAlert` document, including plain users and demoted staff. | major |
| 6 | user management | No way to block or suspend a user. The phone is `immutable`, so it cannot be changed. Reservations, orders and the wallet show as bare numbers with no drill-down. | major (PD) |
| 7 | callroom | The menu grants `CallRoom` to staff, but "create call" is admin-only. Staff with `CallRoom.update` can write `participants` directly, which means they can join a consultation. "Delete" hard-deletes the room and leaves reservations and recordings pointing at nothing. | major |
| 8 | geo | Two geo sources: a static slug list (become requests, `Doctor`) and database ObjectIds (profiles). Nothing maps one to the other. There is no check that a city belongs to its province or a district to its city. Deletes do not cascade. | major |
| 9 | comments | Admins can rewrite a patient's comment text and can create comments for any author. There is no one-review-per-user limit. The resource links for 3 types return 404. | major |
| 10 | devtools | The Snapp test page can request, cancel and pay for **real** rides. `cold/migrate` can wipe production collections. Both ship in production. | major (PD) |
| 11 | tickets | An admin reply does not move the ticket to InProgress. Status changes are never notified. A user's reply reopens a Closed ticket. No SLA or assignee. | minor/major |
| 12 | notifications | The admin chooses the "source" (and can pick "System"). `createdBy` is never set. Content is single-language. | minor |
| 13 | dashboard / inbox | "Payments needing review" is counted on the dashboard but cannot be acted on anywhere. Comments appear in the inbox but not on the dashboard. | major |
| 14 | aiExample | The admin section edits data that no page renders any more. | minor |

---

## 1. Access levels and roles (accesslevel, useraccesslevel, sidebar guard)

**How it works.** The backend enforcement is real. `Routers/autoRouter.ts:1581-1760` adds `restrictTo("admin","notadmin")` plus `hasPermission({model, op})` when a segment has `accessLevel`, and `restrictTo("admin")` otherwise. The frontend (`Components/Admin/UI/adminMenu.tsx:356-383` and `Components/Layout/AdminLayout.tsx:50-53`) hides menu items and returns 404 on direct URLs. So an access level does restrict routes. The defects are in coverage and consistency.

### 1.1 Access-level toggles that do nothing
- **Where:** `BE Models/AccessLevel.ts:17-56` (and the FE copy `Components/Admin/AccessLevel/AdminManageAccessLevelsPage.tsx:46-85`) lists `Comment` and `DoctorSeretaryAccessLevel`. No route uses either one. The `comment` segment (`autoRouter.ts:1022-1035`) has no `accessLevel`, so it is admin-only.
- **Now:** An admin can tick "Comment: readAll/update" for a moderator. The moderator still gets 403 and does not see the menu item.
- **Why wrong:** This is a toggle that is ignored.
- **Fix:** Add `accessLevel: "Comment"` to the `comment` segment and `access: "Comment"` to the menu item at `adminMenu.tsx:104`. Remove `DoctorSeretaryAccessLevel`, or wire it up. Also fix the `Sepciality` typo (it is used consistently, so this is cosmetic, but it shows in the UI).
- **Severity:** major.

### 1.2 Operational sections cannot be delegated
- **Where:** `autoRouter.ts` segments `ticket` (1150), `ticketmessage` (1160), `contactRequest` (1084), `doctorFeedback` (1003), `notification` (1168), `userAlert` (1529), `province`/`city`/`district` (728-753), `paraClinic` (766), `becomeParaClinic` (755), plus `/admin/inbox` and `/admin/dashboard` (`adminRouter.ts:27,51`). None of them has an access-level model.
- **Now:** A support agent who needs to answer tickets or moderate reviews must be given `role: "admin"`. That also gives them appConfig, SMS patterns, finance settings, role changes and the migration wipe.
- **Why wrong:** Doctolib Pro and Docplanner back offices separate support, moderation and ops roles. Least privilege matters in a health product that holds patient data.
- **Fix:** Add `Ticket`, `ContactRequest`, `DoctorFeedback`, `Comment`, `Notification`, `Geo`, `ParaClinic`, `BecomeParaClinicRequest` and `Inbox` to `accessLevelModels` in both repos. Set them on the segments and menu items. Filter `/admin/inbox` by the caller's permissions instead of `restrictTo("admin")`.
- **Severity:** major. **PD:** which roles you want.

### 1.3 Menu and backend disagree
- **Where:** `adminMenu.tsx:93`. The `insuranceaddition` item has no `access`, but the backend segment uses `InsuranceAdditionRequest` (`autoRouter.ts:490`).
- **Now:** Staff who hold that permission get a 404 page (`AdminLayout.tsx:53`).
- **Fix:** Add `access: "InsuranceAdditionRequest"`.
- **Severity:** minor.

### 1.4 The dashboard route is open to staff, but the data is admin-only
- **Where:** `adminMenu.tsx:369` (`segment === ""` returns true), `adminRouter.ts:27` (admin-only). This is handled: `AdminDashboardPage.tsx:369-380` shows a welcome card instead.
- **Now:** Staff land on an empty page with no work queue.
- **Fix:** Give staff a permission-filtered dashboard and inbox. This follows from 1.2.
- **Severity:** minor.

### 1.5 Three UIs for "make someone staff", and one skips the guards
- **Where:**
  - `/admin/users/:id/role` from the user page (`adminUserController.ts:190-233`). It has the guards: no self-change, keep the last admin, check the access level exists.
  - `/auto/useraccesslevel` from "ادمین‌ها" and `ConnectAccessLevelToUserPopup.tsx:50`, which relies only on model hooks.
  - `/auto/user/:id` with `role` in the body, which `adminOnlyFields` allows for admins (`autoController.ts:135-151`).
- **Now:**
  - Through `/auto/user`, an admin can set the **last** admin to `user`.
  - An admin can set `notadmin` with no `UserAccessLevel`. `GET /admin` then returns 403 (`adminController.ts:118-119`) and the account is stuck.
  - Through `/auto/useraccesslevel`, an admin can attach an access level to an admin account. The hooks skip admins, so this leaves a meaningless record.
- **Why wrong:** One concept is modelled through three paths with different invariants.
- **Fix:** Route every role change through `setUserRole`. Drop `role` from what `/auto/user` accepts even for admins, and make the useraccesslevel pages call the same endpoint.
- **Severity:** minor.

### 1.6 The access-level fetch fires for logged-out visitors
- **Where:** `FE Components/Hooks/useAccessLevel.tsx:15`, where the key is `user?.role !== "user"`. This is true when `user` is undefined.
- **Now:** An anonymous visitor who opens `/notadmin` triggers `GET /admin`, which returns 401.
- **Fix:** Use `user && user.role !== "user"`.
- **Severity:** minor.

### 1.7 Access levels can be created without a name
- **Where:** `AccessLevel.ts` (`name: {type:String}`).
- **Fix:** Make `name` `required` and `unique`.
- **Severity:** minor.

---

## 2. User management (user)

### 2.1 No block or suspend
- **Where:** `BE Models/User.ts:18-27` has no `status`/`blocked` field. `authController.protect` (105-135) and `enter`/`login` never check one. The only tool is "log out everywhere" (`adminUserController.ts:237-250`), and the user can log straight back in with a new OTP.
- **Why wrong:** Every marketplace leader (Doctolib, Zocdoc, Paziresh24, SnappDoctor) can suspend patient or provider accounts for fraud, abuse or no-shows.
- **Fix:** Add `status: active|suspended` (plus `suspendedReason`/`suspendedAt`). Reject it in `protect`, `enter` and `login`. Add `PATCH /admin/users/:id/status` (admin only, audited) and a button on `Components/Admin/User/AdminManageUserPage.tsx`.
- **Severity:** major. **PD:** what a suspended provider's public profile shows.

### 2.2 The phone number cannot be changed by anyone
- **Where:** `User.ts:20` has `phone: {..., immutable: true}`. `autoRouter.ts:297-300` lists `phone` as an "admin only field", but mongoose ignores the update because the field is immutable, so the admin option is dead. There is no user-side change-phone flow either (grep finds none).
- **Why wrong:** Iranian users change SIM cards. SMS OTP is the only login, so losing the number means losing the account (medical records, wallet). Paziresh24 and Digikala support phone change through OTP on both numbers or through support.
- **Fix:** Add an admin "change phone" endpoint that verifies uniqueness, logs out everywhere, is audited, and bypasses `immutable` with `updateOne` + `overwriteImmutable` or a raw update. Optionally add a user flow with OTP on the old and new numbers.
- **Severity:** major. **PD.**

### 2.3 Reservations, orders and wallet are counts only
- **Where:** `adminUserController.ts:131-139` returns `counts: {reservations, orders}` and `walletBalance`. `AdminManageUserPage.tsx:249-260` renders them as plain numbers with no links.
- **Now:** Support cannot see a user's bookings, orders or wallet transactions, cannot refund, and cannot correct a balance.
- **Fix:** Add tabs (or links to filtered lists) for Reservation, Order and Transaction/GatewayPayment filtered by `user`. Add an audited manual wallet adjustment that requires a reason.
- **Severity:** major. **PD** for the manual adjustment.

### 2.4 `/auto/user` loads every user into every picker
- **Where:** `autoController.ts:20-38` (`getAll` has no limit). It is used as a picker source in `MutateNotificationPopup.tsx:33`, `CreateCallPopup.tsx:29`, `MutateUserAlertPopup.tsx:37` and `AdminTestPushPage.tsx:87`.
- **Now:** The picker downloads the full user collection. It works at small scale and breaks later.
- **Fix:** Point the pickers at the paginated `/admin/users?q=` endpoint, which already exists.
- **Severity:** minor.

---

## 3. Inbox and dashboard (the pending-work queue)

### 3.1 Pharmacy addition requests are never processed
- **Where:**
  - `BE Controllers/doctorController.ts:1523-1553` creates a `PharmacyAdditionRequest` and alerts staff with `newPharmacyAdditionRequest`.
  - There is no segment in `autoRouter.ts`, no admin page (no `app/[adminKey]/pharmacyaddition`), and no entry in `inboxSources`/`pendingSources` (`adminDashboardController.ts:36-58,258-384`).
  - `Models/PharmacyAdditionRequest.ts:26` also has `submittedAt` with **no default**.
- **Now:** The staff SMS/push says "a doctor asked to add pharmacy X", but there is nowhere to see or approve it. The doctor's request stays "Pending" forever.
- **Fix:** Add the `pharmacyaddition` segment (accessLevel `PharmacyAdditionRequest`), the admin page modelled on clinicaddition, the inbox and dashboard entries, and `default: () => new Date()` on `submittedAt`.
- **Severity:** major.

### 3.2 "Payments needing review" has no screen
- **Where:** `adminDashboardController.ts:57` counts `GatewayPayment {status:"needsReview"}` with no `href`. It is not in the inbox. No admin page lists GatewayPayment; the SEP test page shows only the admin's own payments (`paymentController.ts:133`).
- **Now:** SEP verify-or-reverse failures (`paymentService.ts:295,341`) leave money that may have been debited from the patient, and an admin cannot find or resolve those payments.
- **Why wrong:** This is money that should move and does not. Gateway reconciliation is a standard back-office queue.
- **Fix:** Add an admin GatewayPayment list with a `needsReview` filter and "re-verify / mark refunded / credit wallet" actions. Add it to the inbox.
- **Severity:** major. The payments auditor may also own this.

### 3.3 The dashboard queue and the inbox disagree
- **Where:** `pendingSources` (dashboard) has no `comments`. `inboxSources` has no `paymentsNeedReview`. The FE `kindListPage` (`Components/Admin/Inbox/AdminInboxPage.tsx:28-43`) has no `doctorFeedbacks`, so there is no "see all" link past 50 items.
- **Fix:** Build both from one shared source list.
- **Severity:** minor.

### 3.4 Other pending types not in the inbox
The inbox has no provider-license purchases or renewals awaiting activation, and no staff-alert event exists for contact requests, pending comments or pending doctor feedback. A new review therefore reaches no one until an admin opens the panel. See 5.3.
- **Severity:** minor.

---

## 4. Comments and doctor reviews (comment, doctorFeedback)

### 4.1 Two review systems overwrite the same rating field
- **Where:**
  - `BE Models/Comment.ts:5-19`: `DoctorProfile` is a commentable path.
  - `Comment.ts:63-88,91-96`: on every Comment `save`, the code recalculates the *Approved* comments of that resource and writes `averageScore` and `commentCount` onto the `DoctorProfile`.
  - `Models/DoctorFeedback.ts:86-107`: the verified-visit reviews write `averageScore` and `feedbackCount` onto the same `DoctorProfile.averageScore`.
  - `Controllers/commentController.ts:134-155` lets any logged-in user `POST /api/v1/comment/DoctorProfile/<id>`. There is no check that the resource is commentable in the UI, and the doctor page does not use `CommentSection`.
- **Now:** Any user can post a pending comment on a doctor. The post-save recalculation finds 0 approved comments and sets `averageScore = 0`. This wipes the doctor's verified rating, which feeds search sort and the doctor card, until the next DoctorFeedback change. It is a trivial rating-sabotage bug.
- **Why wrong:** The same concept is modelled twice. Doctolib, Zocdoc and Paziresh24 show one verified-review score per doctor.
- **Fix:** Remove `"DoctorProfile"` from `commentableDocumentPaths` (migrate or delete existing ones), or make the Comment recalculation skip `DoctorProfile`. `DoctorFeedback` is the only doctor rating. Also fix `adminEntityController.ts:239-241`: for doctors it shows `commentCount` next to the feedback average, so it should use `feedbackCount`.
- **Severity:** **blocker**.

### 4.2 Admins can rewrite a patient's comment and fabricate comments
- **Where:**
  - `autoRouter.ts:1022-1035` sets `create: true, edit: true` with no `editSchema`.
  - `FE Components/Admin/Comment/AdminManageCommentPage.tsx:33-39` exposes `content` as an editable textarea.
  - Compare `doctorFeedback` (`autoRouter.ts:1011`), which is `z.strictObject({status})` on purpose.
- **Why wrong:** Rewritten or invented reviews count as fake data. They are also a consumer-law and trust problem. Leaders only moderate, with approve, reject or hide.
- **Fix:** Add `editSchema: z.strictObject({status: z.enum(commentStatuses)})`, remove `create`, and make content read-only in the admin page.
- **Severity:** major.

### 4.3 No limits on comment submission
- **Where:** `commentController.ts:129-155`. `content: z.string()` allows empty text. There is no one-per-user-per-resource limit, and the author is not checked against a purchase or visit.
- **Now:** One user can post unlimited 1★ or 5★ scores on a clinic, product and so on. Moderation is the only defence.
- **Fix:** Add a unique index on `(author, resource)` or upsert. Add `.min(1)` or require content for low scores, and add a rate limit.
- **Severity:** major. **PD:** whether reviews need a verified order or visit, as they do for doctors.

### 4.4 Resource links in the comment list return 404
- **Where:** `AdminManageCommentsPage.tsx:63-64` builds `/${node.refPath.toLowerCase()}/id`.
- **Now:** `ProductPackage`, `ServicePackage` and `ParaClinic` become `productpackage`, `servicepackage` and `paraclinic`, but the routes are `productPackage`, `servicePackage` and `paraClinic`, so the links 404.
- **Fix:** Use an explicit `refPath -> admin href` map.
- **Severity:** minor.

### 4.5 The comment list does not show the text
- **Where:** `AdminManageCommentsPage.tsx`, where the columns are author, status, refPath and resource.
- **Now:** A moderator must open every comment to read it, while the inbox already shows the first 80 characters.
- **Fix:** Add a content column and inline approve/reject buttons, as `AdminManageDoctorFeedbacksPage.tsx:137-150` does.
- **Severity:** minor.

### 4.6 Nobody is notified about moderation
- **Now:** The author is not told when a comment or review is approved or rejected. The doctor is not told when a new approved review arrives. Staff are not alerted about pending ones.
- **Fix:** Send a Notification on status change and add userAlert events (see 5.3).
- **Severity:** minor.

### 4.7 Generic edits skip enum validation
- **Where:** `autoController.ts:52` uses `findByIdAndUpdate(id, body)` without `runValidators`.
- **Now:** Any segment without an `editSchema` (comment, ticket, contactRequest and others) accepts arbitrary status strings.
- **Fix:** Pass `{runValidators: true}` globally.
- **Severity:** minor. It is cross-cutting.

---

## 5. Tickets, contact requests, staff alerts, notifications

### 5.1 The ticket status flow is incomplete
- **Where:**
  - `BE Controllers/supportController.ts:137-167`: when the user replies, `status` is set to "Open" unconditionally, including on Closed or Resolved tickets.
  - `Models/TicketMessage.ts:34-55`: an admin reply only creates a Notification and does not set `InProgress`.
  - The status change (`ChangeTicketStatusPopup.tsx`, which calls `/auto/ticket/:id`) notifies nobody.
  - There is no assignee or SLA, and `content: z.string()` allows empty messages.
- **Now:** Every ticket that has been answered still reads "Open" until someone changes it by hand. The inbox counts Open+InProgress, so the queue never shrinks. Users are not told that their ticket was resolved.
- **Fix:**
  - Admin reply sets `InProgress`, or better an "awaiting user" state.
  - A user reply on a Closed ticket either opens a new ticket or is refused.
  - Status changes notify the user.
  - Add an `assignee` field, `.min(1)` on content, and an `editSchema` on `ticket` limited to `status`/`assignee`.
  - Remove `create` on `ticketmessage` for `isAdmin:false` so an admin cannot post as the user.
- **Severity:** major.

### 5.2 Contact requests are unvalidated and nobody is alerted
- **Where:** `publicController.ts:4228-4244`, where `phone: z.string()` has no `isPhone`. There is no rate limit or captcha. No staff alert event exists. The model has no handler or notes field.
- **Fix:** Validate the phone. Add a `newContactRequest` userAlert event and `handledBy`/`note` fields.
- **Severity:** minor.

### 5.3 Staff alerts go to non-staff, and one event is a dead toggle
- **Where:**
  - `Services/userAlertService.ts:48` sends to every `UserAlert` document, whatever the user's current role.
  - `FE Components/Admin/UserAlert/MutateUserAlertPopup.tsx:34-43` lets the admin pick any user.
  - `UserAccessLevel` delete (`Models/UserAccessLevel.ts:37-47`) demotes the user but leaves their `UserAlert`.
  - `newWithdrawalRequest` (`Models/UserAlert.ts:32-36`) is never fired, yet it has a toggle and an SMS pattern.
  - There are no events for contact requests, pending comments or reviews, doctor join requests, or payments needing review.
- **Now:** A demoted employee, or a plain user added by mistake, keeps receiving SMS and push messages that contain requesters' phone numbers. That is a PII leak.
- **Fix:**
  - Filter subscribers to `role in [admin, notadmin]` and, ideally, to people who have the matching permission.
  - Delete `UserAlert` on demotion.
  - Validate the role in a `pre("save")` hook.
  - Hide `newWithdrawalRequest` until the feature exists, and add the missing events.
- **Severity:** major.

### 5.4 Notification source and author can be spoofed
- **Where:**
  - `BE Controllers/adminController.ts:81-94` spreads `...rest` from the body into `insertMany`, so `source`, `createdBy`, `isRead` and so on are whatever the client sends.
  - `FE MutateNotificationPopup.tsx:41-45` lets the admin choose "System" or "Admin".
  - `createdBy` is never set, so the "createdBy" column (`autoRouter.ts:1175`) is always empty.
- **Fix:** Set `source: "Admin", createdBy: req.user._id` on the server and whitelist `title/message/link`. Do the same for `/auto/notification` create and edit.
- **Severity:** minor.

### 5.5 Notifications are single-language, and there is no broadcast
- **Now:** Admin notifications and the system notifications in `TicketMessage.ts`, `reservationCancelService.ts`, `orderSettlementService.ts` and `reservationProgressService.ts` are hardcoded Persian. Users on the other 14 locales receive Persian. There is no "send to all users" or "send to a segment" option (all doctors, a city).
- **Fix:** Store a text key plus variables (or add the translatable plugin to Notification), and add segment targeting.
- **Severity:** minor. **PD.**

---

## 6. SMS patterns compared with the events actually sent

- **In sync:** The pattern list in `BE Models/SmsPatterns.ts:8-14` and `FE Components/Admin/SmsPatterns/AdminManageSmsPatternsPage.tsx` match. Every pattern that exists is sent, except the one in 6.1.

### 6.1 Dead pattern
`NEW_WITHDRAWAL_REQUEST_PATTERN`, from `newWithdrawalRequest`, is never triggered. See 5.3.
- **Severity:** minor.

### 6.2 SMS messages that should exist and do not
- The patient and doctor get no SMS when a reservation is **cancelled** (`Services/reservationCancelService.ts:93-108` sends an in-app notification only).
- The applicant gets no SMS when a become-provider request is approved or rejected.
- The user gets no SMS when an order changes status or ships.
- The user gets no SMS when a ticket is answered.

Doctolib, Paziresh24 and Nobat all send an SMS on cancellation. In Iran SMS is the channel people actually read, since push is unreliable.
- **Fix:** Add the `reservationCancelledPatient`/`Doctor`, `becomeRequestDecision`, `orderStatusChanged` and `ticketAnswered` events to the event arrays. The pattern fields then appear automatically.
- **Severity:** major. **PD** on which events to send.

### 6.3 No way to test a pattern
There is no "send test SMS" button on the patterns page. Only the OTP flow reveals a broken pattern code.
- **Severity:** minor.

---

## 7. Geo data (province, city, district)

### 7.1 Two geo sources that never meet
- **Where:**
  - Static slugs: `Lib/Provinces.ts` and `Lib/Cities.ts`, used as `enum` by `BecomeDoctorRequest.ts:81-82`, `Clinic/Hospital/PharmacyAdditionRequest` and the legacy `Doctor.ts:70-71`.
  - Database: `Models/Geo/*`, as ObjectId refs on `DoctorProfile`, `Clinic`, `Pharmacy`, `Hospital` and `ParaClinic`.
  - No code maps the slug to the ObjectId: grep finds no `Province.findOne({slug})` on the approval paths. `City` has no `slug` field at all.
- **Now:** The province and city a doctor enters when applying are lost when the profile is created. The admin geo tables and the static list can drift apart; for example, a city the admin adds cannot be chosen in the become forms.
- **Fix:** Make the database the single source. Have the become and addition forms use the `getProvinces`/`getCities` endpoints and store ObjectIds. Migrate the existing slugs, add `slug` to City, and copy the location on approval.
- **Severity:** major.

### 7.2 No parent consistency check
- **Where:** `doctorController.ts:434-451` (the same pattern appears in `pharmacyController.ts:146-160`, `hospitalController.ts:135-150`, `paraClinicController.ts:142-156` and `clinicController.ts:~150-162`). It checks that each id exists and is active, but not that `city.province == province` or `district.city == city`.
- **Now:** A profile can say "Tehran province, Shiraz city, a district of Mashhad". Search by city or province then returns inconsistent results.
- **Fix:** Query `City.exists({_id: city, province, isActive})` and `District.exists({_id: district, city, isActive})`. Clear the children when a parent changes.
- **Severity:** major.

### 7.3 Deletes and deactivation do not cascade
- **Where:** `autoRouter.ts:728-753` (`remove: true` on all three, `findByIdAndDelete`, no hooks in `Models/Geo/*`).
- **Now:** Deleting a province leaves orphan cities and districts, and profiles referencing a missing province. Deactivating a province leaves its cities selectable through the profile update, because only the city's own `isActive` is checked.
- **Fix:** Block the delete while children or profiles reference it (or soft-delete only). Check the parent's `isActive`.
- **Severity:** minor.

### 7.4 No seed data, and `isActive` defaults to false
Nothing seeds `Province`/`City`. On a fresh server, providers cannot set any location until an admin creates and activates each one by hand. `Province.slug` is optional, yet public search looks provinces up by slug (`publicController.ts:1748-1756`).
- **Fix:** Seed from `Lib/Provinces.ts`/`Cities.ts` in `setup.sh` and make `slug` required.
- **Severity:** minor.

---

## 8. Call rooms (callroom)

### 8.1 Staff permission does not match the create route
- **Where:** `adminMenu.tsx:106` shows the item to staff with `CallRoom`. `CreateCallPopup.tsx:43` posts to `/admin/call/create`, which is `restrictTo("admin")` (`adminRouter.ts:173-181`).
- **Now:** For staff, the create button always returns 403.
- **Fix:** Guard `/admin/call/create` with `hasPermission({model:"CallRoom", op:"write"})`.
- **Severity:** minor.

### 8.2 Raw CRUD bypasses the call service
- **Where:** `autoRouter.ts:512-523` gives the `callroom` segment `create/edit/remove` with no schema.
- **Now:** Staff with `CallRoom.update` can edit `participants`, `status` or `recordingEnabled` on **any** room, including telemedicine consultations tied to a reservation, and so add themselves to a patient's call. "Destroy" (`DestroyCallPopup.tsx:25`) hard-deletes the room without ending it through `callService`. That leaves `Reservation.callRoom`, `CallParticipant`, `CallEvent` and `CallRecording` dangling.
- **Why wrong:** This is a medical-privacy boundary. Teladoc and One Medical give admins read-only call metadata, and ending a call goes through the service.
- **Fix:** Make the segment read-only (`all`/`one`). Add `/admin/call/:id/end`, which calls the service's end flow. Never hard-delete rooms linked to a reservation.
- **Severity:** major.

---

## 9. Tamin (e-prescription reference data and test consoles)

### 9.1 Production uses the Tamin sandbox
- **Where:**
  - `BE Controllers/adminController.ts:132-379`: every "refresh" (serviceType, prescriptionType, services, parTaref, drugUsage/Instruction/Amount, phPlan, phIllness, ICD, complaint, spec) fetches from `https://ep-test.tamin.ir`.
  - The live prescribing paths use `ep-test`/`ap-test`/`account-pilot` with hardcoded test IDs `1234567891/2000200092`: `doctorController.ts:2612,2698,3248,3267,3349,3607,3768,3802`, plus `pharmacyController`, `clinicController`, `paraClinicController` and `prescriptionController` (about 38 occurrences).
- **Now:** The reference catalog comes from the sandbox, and prescriptions are sent to the sandbox, so no real Tamin e-prescription is ever issued.
- **Fix:** Move the base URLs and provider IDs to `AppConfig` (a sandbox or production switch) and use the provider's own IDs.
- **Severity:** **blocker** for go-live. **PD** and credentials needed. The prescription auditor may also own this.

### 9.2 Menu path casing
`adminMenu.tsx:217` links to `tamin/Icids`. The route exists, but its capitalisation is inconsistent with the other Tamin paths.
- **Severity:** minor. Cosmetic.

---

## 10. Dev and test tools in production (devtools, pushTest, snappTest, sepTest, tamin tests, old, cold)

### 10.1 The Snapp test console acts on the real account
- **Where:** `adminController.ts:423-458` accepts `requestRide`, `cancelRide` and `payment` against `snappClient`, which uses the production credentials.
- **Now:** An admin click orders a real courier ride and charges the account.
- **Fix:** Hide the test consoles unless `AppConfig.devToolsEnabled` (or a non-production env) is set, and allow only read actions (`balance`, `price`) in production.
- **Severity:** major. **PD.**

### 10.2 One-click wipes of production data
- **Where:** `Routers/migrationRouter.ts` and `Controllers/migrationController.ts:154` (`dropAllDoctors: Doctor.deleteMany()`; the same for blogs, diseases, drugs, parts, specialities and symptoms), reached from `cold/migrate` (`Components/Admin/Old/Migrate/AdminManageMigrationPage.tsx:55`). There is a typed confirmation.
- **Now:** Any super admin can wipe catalog collections in production after the one-time migration is finished.
- **Fix:** Put it behind an env flag, or remove it after the migration. At minimum, keep a backup before deleting.
- **Severity:** major. **PD.**

### 10.3 The legacy router is not audited
- **Where:** `/api/v1/old` (`app.ts:102`) has no `auditAdminActions`, although `oldRouter` allows create, edit and remove.
- **Fix:** Add the audit middleware, or make the router read-only.
- **Severity:** minor.

### 10.4 A GET that writes
- **Where:** `ollamaRouter.ts` (`GET /ollama/tags` calls `refreshModels`, which writes models).
- **Now:** The audit middleware skips GETs (`adminAudit.ts:53`), so this write is not logged.
- **Fix:** Make it a POST.
- **Severity:** minor.

---

## 11. Audit log (audit)

### 11.1 Log entries say what was touched, not what changed
- **Where:** `Services/adminAudit.ts:66-85`, which stores only `fields` (key names).
- **Now:** "update user X, fields [role]" is recorded, but not the before and after values. The role change keeps `details.role` but not the access level.
- **Fix:** Store old and new values for a whitelist of sensitive fields (role, status, price, phone, isActive) and the `accessLevel` on role changes.
- **Severity:** minor.

### 11.2 Viewing sensitive data is not logged
Views of `/admin/users/:id` (national ID, wallet) and `/auto/*` reads are not logged. For health data, access logging is expected.
- **Severity:** minor. **PD.**

---

## 12. aiExample and ollama

### 12.1 aiExample edits nothing visible
- **Where:** `publicController.ts:187` still loads `AiExample`, but `FE Components/Home/HomeHero.tsx:35-38` says the strip "has been dropped" and `examples` is no longer rendered. No other page reads it. The model also lacks the `translatable` plugin, and `category` is free text that nothing reads.
- **Now:** Admins maintain a section with no effect on the site.
- **Fix:** Remove the menu item and segment (and stop the query in `getHome`), or bring the strip back with translation support.
- **Severity:** minor. **PD.**

---

## 13. Analytics

### 13.1 Visit tracking can be abused
- **Where:** `analyticsRouter.ts` (`POST /analytics/visit` is anonymous with no rate limit).
- **Now:** Anyone can inflate the analytics page.
- **Fix:** Add a per-IP/visitor rate limit.
- **Severity:** minor.

---

## 14. Sidebar and menu integrity (checked)

- Every menu or hub `href` has a page. Script check: `comm` of `app/[adminKey]/**/page.tsx` against the `adminMenu.tsx` hrefs.
- Every top-level page is reachable from the menu or a hub. `city/[nodeId]` and `district/[nodeId]` are reached from the province page.
- The "old", "cold" and "devtools" sections are grouped under one super-only hub (`adminMenu.tsx:291-327`). They are hidden from staff, but visible to every super admin in production. See section 10.
- Items without an access model cannot be delegated: `paraClinic`, `becomeParaClinic`, `insuranceaddition`, all of the users/support group except user and callroom, the catalog, content, licenses and AI. See 1.2.

---

## Items that need a product decision
1.2 role design · 2.1 suspension policy · 2.2 phone change · 2.3 manual wallet adjustment · 4.3 verified-only reviews · 5.5 notification i18n and broadcast · 6.2 which SMS events to send · 9.1 Tamin production credentials · 10.1 and 10.2 dev tools in production · 11.2 read logging · 12.1 aiExample.

## Not fixed
Nothing was fixed. This was a read-only audit as instructed.
