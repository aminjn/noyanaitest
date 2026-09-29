# Logic audit: medical centers (clinic, hospital, paraClinic/lab, pharmacy, insurance)

Scope: super admin sections clinic, clinicCategory, clinicTag, clinicaddition, becomeclinic, hospital, hospitalCategory, hospitalTag, hospitaladdition, becomehospital, paraClinic, paraClinicCategory, paraClinicTag, becomeParaClinic, test, testCategory, pharmacy, becomepharmacy, insurance, insuranceCategory, insuranceTag, insuranceaddition, becomeinsurance, base*License. Also the public pages and center panels that show the same data.

Mode: read-only. **No files were changed.** Paths are relative to `noyanaitest-back/` (BE) or `noyanaitest/` (FE).

Severity scale: **blocker** (broken flow, a crash, or fake data shown to users), **major** (wrong business logic, or a layer that does nothing), **minor** (inconsistency or polish). **[PD]** means the fix needs a product decision.

---

## 0. Benchmark frame (docs/market-benchmark.md plus the leaders' known patterns)

- **Doctolib / Zocdoc / Docplanner practice pages.** A center page lists its practitioners, each with next availability and a **Book** button. Insurance accepted is a first-class search filter (Zocdoc's primary filter). Onboarding a practice is one flow: claim, verify, activate. The practice can add its own practitioners.
- **Paziresh24 / Nobat.** Center pages list doctors and link to their booking pages. The "طرف قرارداد بیمه" (insurers under contract) are shown per center and per doctor.
- **Halodoc / Vezeeta (labs).** You pick a test, see which labs offer it with a price, then book (or book home sampling). The benchmark notes that diagnostics is the profitable segment (Thyrocare made ₹176 cr profit while e-pharmacy lost money). A lab page with a dead "reserve test" button is directly lost revenue.
- **Iran.** Tamin and Salamat are basic insurance, and acceptance matters for pharmacies and labs. Pharmacies need phone numbers and a 24-hour (شبانه‌روزی) flag.

NoyanAI today matches none of these end-to-end. Centers are brochure pages (no booking CTA, doctors not clickable), insurance acceptance is modelled four different ways and never filtered on, and only one of the five become-X approvals actually creates anything.

---

## 1. Become-X approval flow (becomeclinic / becomehospital / becomeParaClinic / becomeinsurance / becomepharmacy)

### 1.1 Approving clinic/hospital/paraClinic/insurance requests creates and activates nothing — **blocker**
- **Now:** Only pharmacy has a real approve endpoint (`Controllers/adminEntityController.ts:277-311`, `Routers/adminRouter.ts:35`). For the other four, the admin UI offers two unrelated manual steps:
  - "تغییر وضعیت" (change status) calls the generic `POST /auto/become<x>/:id` (`FE Components/Admin/BecomeClinic/ChangeBecomeClinicRequestStatusPopup.tsx:31`). It only flips `status`.
  - "تخصیص کلینیک" (assign clinic) sets `user` on an **already existing** clinic (`AssignClinicToClinicRequestPopup.tsx:22-29`). The same pattern repeats in the BecomeHospital, BecomeParaCliinc and BecomeInsurance folders.
  - Nothing copies the request's `name/siamCode/nationalId/description` into a center. Nothing activates it and nothing notifies the applicant. Setting "Approved" without assigning leaves the user with no panel. Assigning without approving leaves the request "Pending" forever.
- **Why wrong:** The label "approve" does not do what it says. Leaders use a single claim → verify → activate step. Pharmacy was already fixed to this pattern, so the five types are now inconsistent.
- **Fix:** Generalise `approveBecomePharmacy` into `approveBecomeOrg(kind)`:
  - find or create the org by `user`;
  - copy the name (and summary into description/summary);
  - set `active` (or `isActive` for hospital) to true;
  - generate a slug;
  - set the request to Approved and notify.
  - Add routes `/admin/become{clinic,hospital,paraClinic,insurance}/:id/approve`, plus a "reject" that notifies.
  - Use the same UI button as `AdminManageBecomePharmacyPage.tsx:42-133`.
  - Keep "assign existing" only as a secondary action that also sets status Approved.

### 1.2 No transition guard on approve/assign/status — **major**
- **Now:**
  - `approveBecomePharmacy` does not check `status === "Pending"`. The UI hides the button only when the request is Approved (`AdminManageBecomePharmacyPage.tsx:127`), so a **Rejected** request can be approved.
  - Re-running it re-activates a pharmacy the admin had deliberately deactivated (`adminEntityController.ts:291-293`) and sends another notification.
  - The generic `/auto/become*` edit accepts any status, so Approved → Pending → Rejected → Approved are all allowed. `autoController.edit` (`Controllers/autoController.ts:52`) runs `findByIdAndUpdate` without `runValidators`, so even the status enum is not enforced on edit.
- **Fix:**
  - Allow only Pending → Approved/Rejected (409 otherwise).
  - Add `editSchema: z.strictObject({status: z.enum(["Rejected"])})` on the auto entries (approval goes only through the dedicated endpoint).
  - Pass `runValidators: true` in `autoController.edit`.

### 1.3 A user whose request was rejected (or approved but not linked) is stuck on "pending" — **major**
- **Now:** `FE Components/Become/BecomeClinicRequestPage.tsx:44-55` (and the hospital/insurance/pharmacy/paraClinic copies) passes any existing request as `pending`. It does this regardless of `status`. `BecomeOrganizationForm.tsx:84-179` then shows the "pending application" banner and makes every field read-only.
  - The backend would actually allow a resubmission. `clinicController.becomeAClinic` (`Controllers/clinicController.ts:59-72`) only blocks when status is Pending.
  - Because it upserts, the same call also silently turns an **Approved** request back to Pending when no clinic was linked.
- **Fix:**
  - Show Pending as read-only.
  - Show Rejected with its reason, plus an editable form to resubmit.
  - Show Approved-without-org as "being set up".
  - In the backend, refuse resubmission when the status is Approved.

### 1.4 Assign popups pre-select the request's own id as the center — **minor**
- `AssignClinicToClinicRequestPopup.tsx:47`, `AssignHospitalToHospitalRequestPopup.tsx:47` and `AssignParaClinicToBecomeParaClinicRequestPopup.tsx:47` all set `defaultValue={node._id}`. That is the BecomeRequest id, not a clinic id.
- Assigning also silently steals ownership from the clinic's previous user. If the applicant already owns another clinic, the `user` unique index returns an opaque error.
- **Fix:** No default value. Warn when the target already has a `user`.

### 1.5 `becomeParaClinic` differs from the other four — **minor**
- `Routers/autoRouter.ts:755-765` has no `accessLevel` (so only full admins can use it) and **allows `create`** (the others do not).
- `Models/BecomeParaClinicRequest.ts` puts `required: true` on a different line from the others (diff line 32/33). Verify that `user` is still required.
- `paraClinic` itself (`autoRouter.ts:766`) also has no `accessLevel`, while clinic, hospital, pharmacy and insurance do.
- The dedicated approve route is `restrictTo("admin")` only (`adminRouter.ts:35-39`). Staff holding the `BecomePharmacyRequest` access level can list requests but cannot approve them.
- **Fix:** Align all five: same flags, same access-level keys.

### 1.6 Approval creates a pharmacy with no slug, phone or address — **minor**
- `adminEntityController.ts:285-290` sets only `user`, `name`, `summary` and `active`. Slugless nodes are excluded from sitemaps (`publicController.ts:4428`), and pharmacy is not a sitemap type at all (see 6.2).

---

## 2. Doctor-submitted "addition" requests (clinicaddition / hospitaladdition / insuranceaddition / pharmacy addition)

### 2.1 "Create clinic/hospital from request" always fails — **blocker**
- **Now:** `FE Components/Admin/ClinicAddition/CreateClinicFromRequestPopup.tsx:49-54` and `HospitalAddition/CreateHospitalFromRequestPopup.tsx:49-54` POST `{province: node.province, city: node.city}`.
  - The addition models store **legacy slug strings** (`Models/ClinicAdditionRequest.ts:48-49`: `enum: provinceSlugs`, for example `"آذربایجان-شرقی"`).
  - `Clinic.province` and `Hospital.province` are `ObjectId ref "Province"` (`Models/Clinic.ts:61-63`). Mongoose's cast fails and the create errors.
  - Even with valid data, the popup does not copy the address or owner phone, does not mark the request Done, and does not add the requesting doctor as a `ClinicDoctor`.
- **Fix:**
  - Migrate the addition models to Geo refs (Province/City ObjectIds, like the org profiles), or map slug → Geo doc on the server.
  - Replace the popup with a backend endpoint `/admin/clinicaddition/:id/create` that creates the center (inactive) with name/address/geo, sets the request to Done, and optionally links the submitter as a member.

### 2.2 Pharmacy addition requests have no admin section — **blocker**
- **Now:** Doctors can submit pharmacy addition requests (`Routers/doctorRouter.ts:408-418`, `doctorController.ts:1531`, FE `DoctorPanel/Pharmacy/SubmitPharmacyAdditionRequestPopup.tsx`). But `autoRouter.ts` has no `pharmacyaddition` entry and there is no `app/[adminKey]/pharmacyaddition` page, so nobody can see or process these requests.
- `Models/PharmacyAdditionRequest.ts:26-27` also lacks the `submittedAt` default and the `required` on `submittedBy` that the other three have.
- **Fix:** Add the auto entry, admin page and dashboard counter, mirroring hospitaladdition. Align the model.

### 2.3 Insurance addition "create" only copies the name and never closes the request — **minor**
- `CreateInsuranceFromRequestPopup.tsx:59-61`. The request stays Pending after the insurance is created.

### 2.4 Status enum typo "Proccessing" — **minor**
- `Models/ClinicAdditionRequest.ts:9`. It is shared by all addition models.

---

## 3. The five center types are modelled inconsistently

| Field / concept | Clinic | Hospital | ParaClinic | Pharmacy | Insurance |
|---|---|---|---|---|---|
| active flag | `active` | **`isActive`** | `active` | `active` | `active` |
| image | `image` | `image` | `image` (ignored on detail page) | **`avatar` + `banner`** | `image` |
| phone | yes | yes | yes | **no** | yes |
| business hours | `businessTimes` | `businessTimes` | **`businessTime`** | **no** | – |
| category / tags | yes | yes | yes | **no** | yes |
| insurances accepted | `insurances[]` | `insurances[]` | `insurances[]` **+ `basicInsurance` bool** | **no** | n/a |
| rating (`averageScore/commentCount`) | yes | yes | yes | **no** | yes |
| 2dsphere index | yes | yes | yes | **no** | yes |
| `toJSON: virtuals` | yes | yes | yes | **no** | yes |
| owner concept | `user` (+ user's DoctorProfile shown as owner) | `user` **and** a separate `owner: DoctorProfile` | `user` | `user` | `user` |
| personelCount type | Number | **String** in schema, number in interface/panel | Number | – | – |
| doctor membership | ClinicDoctor + join requests | HospitalDoctor + join requests + HospitalClinic | none | DoctorPharmacy (doctor-side only) | DoctorInsurance (doctor-side only) |

### 3.1 Hospital uses `isActive`, which breaks generic code — **blocker** (SEO) / **major**
- `publicController.ts:4409`: the sitemap filter for hospital is `{ active: true }`, but the field is `isActive` (`Models/Hospital.ts:60`). **The hospital sitemap is always empty.** The comment above it ("same filter each controller already applies") is wrong.
- `adminEntityController.ts:233`: Entity 360 reports `active: node.active`, which is always `undefined` for hospitals, so it shows as inactive.
- **Fix:** Rename `Hospital.isActive` → `active` with a migration (`updateMany({}, {$rename: {isActive: "active"}})`), then update `getHospitals`/`getHospital`/`globalSearch` (`publicController.ts:1753,1797,1817,2757`) and the admin form (`AdminManageHospitalPage.tsx:268`). A smaller fix is to change the sitemap filter to `isActive`.

### 3.2 Pharmacy is a second-class center — **major** [PD]
- **Now:** Pharmacy has no phone, no hours or 24h flag, no category/tags, no insurance acceptance (Tamin/Salamat matter most for pharmacies in Iran), no rating, no geo index and no list page.
- The admin pharmacy form (`FE Components/Admin/Pharmacy/AdminManagePharmacyPage.tsx:143-176`) cannot edit slug, summary, address, avatar or banner. There is also no User tab, so the admin cannot link an owner except through the become flow.
- **Fix:**
  - Add `phone`, `isRoundTheClock`, `insurances[]`, `averageScore/commentCount`, the 2dsphere index and `toJSON: {virtuals: true}`.
  - Add slug/summary/address/avatar/banner and a User tab to the admin form.
  - Decide whether pharmacies get categories.

### 3.3 Hospital has two "owner" concepts — **minor** [PD]
- `Models/Hospital.ts:88-93` has `owner: DoctorProfile` (admin-set, shown publicly as the owner) and also `user` (the panel login).
- A clinic shows the owner as "the DoctorProfile of `user`" (`publicController.ts:1675-1697`).
- **Fix:** Pick one: derive the owner from `user` for every type, or add an explicit `owner` to all.

### 3.4 ParaClinic `specialities` is written but never read — **minor**
- The admin can fill it (`AdminManageParaClinicPage.tsx:347`), but no public or filter code reads it.
- The `paraClinic` editBodyMutator (`autoRouter.ts:776-780`) does not JSON-parse `specialities`, so a multi-select save may store a string.
- **Fix:** Remove the field, or use it in the lab search filter.

---

## 4. Categories, tags, additions: what reads them

| Layer | Written by | Read by |
|---|---|---|
| ClinicCategory | admin, clinic panel | clinic list filter (`getClinics`), card badge, detail intro |
| ClinicTag | admin, clinic panel | **display badges only** (card, detail). No filter anywhere |
| HospitalCategory | admin, panel | hospital list filter + badge |
| HospitalTag | admin, panel | display only |
| ParaClinicCategory | admin, panel | paraClinic list filter |
| ParaClinicTag | admin, panel | display only |
| InsuranceCategory | admin, panel | insurance list filter + card badge |
| InsuranceTag | admin, panel | display only. `getInsurance` does not even populate tags (`publicController.ts:2522-2529`), so the detail page cannot show them |
| TestCategory | admin | label on the test card only. `getTests` has no category filter (`publicController.ts:1968-1988`) |
| `services: string[]`, `certificates: string[]` (clinic/hospital) | admin, panel | display only |
| `isRoundTheClock`, `onPremises`, `onlineResponse`, `basicInsurance` | admin, panel | display only. Nothing filters on them |

### 4.1 Tags are a meaningless layer that overlaps `services`, `certificates` and the boolean flags — **major** [PD]
- **Why wrong:** The admin maintains four tag collections plus free-text `services`, yet no search, filter, SEO page or booking step uses them. On the clinic booking card they are faked anyway (see 5.1).
- **Fix (decision):**
  - Either make tags real facets: add a `tag` filter to `getClinics`/`getHospitals`/`getParaClinics`/`filterBookingClinic`, and turn the boolean flags ("24h", "home sampling", "online results") into tags or filters.
  - Or delete the tag models and keep `services`.

### 4.2 Category filters are inconsistent — **minor**
- Clinic and paraClinic accept an array of categories and do **not** check `isActive` or the slug-vs-id rule (`publicController.ts:1476-1486`, `1864-1874`).
- Hospital and insurance accept a single category, check `isActive`, and 404 on an unknown one (`1766-1781`, `2474-2488`).
- Clinic/paraClinic `categories` lists are not sorted by `order` (`1493`, `1881`).
- Hospital has a province filter; the others do not.
- `getInsurances` uses `HOSPITALS_PAGE_SIZE` (`2493-2494`) instead of `INSURANCES_PAGE_SIZE`.
- **Fix:** One shared `buildCenterListFilter(model, categoryModel)` helper.

### 4.3 Category/tag option endpoints return inactive items — **minor**
- `getClinicCategories`/`getHospitalCategories`/`getParaClinicCategories`/`getInsuranceCategoryOptions` (`publicController.ts:4172-4226`) do not filter `isActive`. The panel dropdowns therefore offer inactive categories, which the panel update then rejects with a 404 (`clinicController.ts:164-170`).
- Tag options are sorted by `order: -1` (`471-515`), while categories are sorted by `order: 1`.

### 4.4 Slugs are not unique on Test/TestCategory; ClinicTag has no slug — **minor**
- `Models/Test.ts:19` and `Models/TestCategory.ts:19` declare `slug: { type: String }` with no unique/sparse index. The other center taxonomies have one.

---

## 5. Duplicate card designs and fake data

The homepage has no center cards (it only uses `UI/DoctorCardAlt`). Centers have **six** card implementations:

| Card | Used in | Problems |
|---|---|---|
| `Clinic/ClinicCard.tsx` | clinic list, SearchModal | none severe; crashes if `tags` is missing (`:80`) |
| `Disease/ClinicCardAlt.tsx` | disease page side list | **hardcoded rating 4.5** (`:40`) |
| `Booking/CommonCenterCard.tsx` | /book clinic tab | **hardcoded tags "Tag1…Tag6"** (`:71-76`), **rating "4.5"** (`:84`), **"50 doctors registered"** (`:137`), **"50 products registered in pharmacy" on a clinic** (`:207`); "see profile" button has no href (`:106-116`); "see bookings", "see services", "see doctors" and "see on map" buttons have no handler |
| `Hospital/HospitalCard.tsx` | hospital list, SearchModal | **"6 specialities" hardcoded** (`:74`); `bedCount.toString()` crashes if the field is missing (`:69`); empty icon (`:67`) |
| `ParaClinic/ParaClinicCard.tsx` | lab list, SearchModal | no rating (the model has one) |
| `Insurance/InsuranceCard.tsx` | insurance list, SearchModal | shows hand-typed counts (see 7.2) |
| `Booking/PharmacyBookingCard.tsx` | /book pharmacy tab | fake data commented out; OK |

### 5.1 Fake data on public center cards — **blocker**
- **Fix:** Delete `ClinicCardAlt`. Make one `CenterCard` (image, name, category, rating from `averageScore/commentCount`, province, real tags, "N doctors" from an aggregated count, link) and reuse it in list pages, disease page, booking and search.
- `CommonCenterCard` must receive real `doctorsCount`, `averageScore` and `tags` from `filterBookingClinic`, and its CTA must link to `/clinic/[slug]`.

### 5.2 Center doctor lists use their own doctor card with a fake 4.9 rating and no link — **blocker**
- `Clinic/MedicalCenterDoctors.tsx:20-54` (used by the clinic and hospital pages) and `Clinic/MedicalCenterDepartments.tsx:101` render a private doctor item. Its rating is hardcoded `<span>4.9</span>`, and it is **not clickable**: no link to `/dr/[slug]` and no booking.
- **Why wrong:** The brief's rule is that every doctor card reuses the homepage `DoctorCardAlt`. At Doctolib and Paziresh24, a practice page is where you pick a doctor and book.
- **Fix:** Render `UI/DoctorCardAlt` (the backend must populate the same doctor fields as the homepage/booking: settings and province). Filter to `active: true` doctors (see 8.3).

### 5.3 Other dead ends on center pages — **major**
- `ParaClinic/ParaClinicIntro.tsx:178-205`: the primary CTA "reserveTest" and the "call" button have no onClick or href. Fix: scroll to the tests section / add to cart, and `tel:`.
- `ParaClinicIntro.tsx:88-101`: the detail hero uses only gallery `images`. The `image` field that the panel and admin set, and the card shows, is ignored, so labs without gallery images get a blank hero.
- Insurance chips (`MedicalCenterInsurances`), specialities (`MedicalCenterSpecialities`) and hospital clinics (`HospitalPageClinics`) have no links to `/insurance/[slug]`, `/speciality/[slug]` or `/clinic/[slug]`.
- The clinic and hospital pages have no "book" CTA at all (`WideIntro.tsx`, `MedicalCenterContactInfo.tsx`).
- `console.log` is left in `Hospital/HospitalPage.tsx:49,64`, `HospitalPageClinics.tsx:12` and `Insurance/InsurancesPage.tsx:51`.

---

## 6. Public pages, routes and SEO

| Route | List page | Detail page | Sitemap |
|---|---|---|---|
| /clinic | yes | yes | yes |
| /hospital | yes | yes | **empty (3.1)** |
| /paraClinic | yes | yes | yes |
| /insurance | yes | yes | yes |
| /pharmacy | **no list page** (only /book pharmacy tab) | yes | **not a sitemap type** |
| /test | yes | **no `/test/[slug]` → TestCard links 404** | no |

### 6.1 TestCard links to a route that does not exist — **blocker**
- `FE Components/Test/TestCard.tsx:40` links to `/test/${slug||_id}`, but only `app/test/page.tsx` exists.
- **Why wrong:** Halodoc and Vezeeta build the lab flow on test pages ("CBC: labs offering it, price, book").
- **Fix:** Add `app/test/[slug]` with a backend `getTest` that returns the test plus the `ParaClinicTest` offers from active labs, sorted by price. Or drop the link. [PD]

### 6.2 Pharmacy is missing from the sitemap, the global search and the map — **major**
- `sitemapNodeTypes` (`publicController.ts:4373-4389`) and `globalSearch` (`2648-2920`) have no pharmacy. `searchInMap` (`811-836`) returns doctors only, even though clinic, hospital, paraClinic and insurance have 2dsphere indexes. [PD for the map]

### 6.3 Clinic/hospital/paraClinic/insurance detail pages have no metadata fallback — **major** (SEO)
- `app/clinic/[slug]/page.tsx:15`, `hospital/[slug]:17`, `paraClinic/[slug]:17` and `insurance/[slug]:17` return `{}` unless an admin has written a PageMeta entry. Pages then have no `<title>` and no structured data.
- `app/pharmacy/[slug]/page.tsx:15-21` already falls back to the node's name/summary. Copy that, and emit `MedicalClinic`/`Hospital`/`MedicalOrganization` JSON-LD by default.

### 6.4 Duplicate URLs for the same insurance — **minor**
- `getInsurance` (`publicController.ts:2519-2521`) accepts `_id` even when the insurance has a slug. The other getters add `slug: {$exists: false}` to prevent this.

---

## 7. Insurance acceptance logic

### 7.1 "Which insurers are accepted" is modelled four ways and never used to filter — **major** [PD]
- The four models:
  - Clinic/Hospital/ParaClinic: `insurances: ObjectId[]` on the center.
  - ParaClinic: an extra `basicInsurance: boolean` that is not tied to any insurer.
  - Doctor: the `DoctorInsurance` join collection (`Models/DoctorInsurance.ts`). The doctor adds it unilaterally, and `addInsurance` does **not** check `Insurance.active` (`doctorController.ts:1411`). `addPharmacy` does check it (`:1488`).
  - Insurance itself: free-text counts (7.2).
- Missing pieces:
  - No endpoint filters doctors or centers by insurance: `filterBooking2`, `filterBookingClinic` and `filterBookingPharmacy` have no `insurance` parameter.
  - The insurance detail page does not list the doctors or centers that accept it (`getInsurance` populates only category and plans).
  - The insurance panel cannot see or confirm who claims to accept it.
- **Why wrong:** Insurance is Zocdoc's primary search filter, and Paziresh24 shows contracted insurers. In Iran, Tamin/Salamat acceptance decides where patients go.
- **Fix:**
  - One join model `InsuranceAcceptance {insurance, node, nodeModel: Doctor|Clinic|Hospital|ParaClinic|Pharmacy, status}` (or keep the arrays and add `DoctorInsurance` parity).
  - Add an `insurance` filter to every booking/list endpoint.
  - List the accepting doctors and centers on `/insurance/[slug]`.
  - Replace `basicInsurance` with real Tamin/Salamat references.
  - Optionally let the insurer confirm acceptance.

### 7.2 Insurance counts are hand-typed strings, and doctors are counted twice — **blocker** (fake numbers)
- `Models/Insurance.ts:17-23,55-61` has `membersCount, centersCount, doctorsCount, pharmacyCount, **doctorCount**, hospitalCount`, all strings.
  - The admin form (`AdminManageInsurancePage.tsx:308-317`) shows both "تعداد پزشکان" (`doctorsCount`) and "تعداد دکتر" (`doctorCount`).
  - The card reads `doctorsCount` (`InsuranceCard.tsx:124`) while the detail page reads `doctorCount` (`InsurancePageInfo.tsx:74`), so the two can disagree.
  - The insurer's own panel can set any of them (`InsuracneController.ts:113-118`).
- **Fix:** Compute the doctor/clinic/hospital/pharmacy counts from the acceptance data in `getInsurances`/`getInsurance`. Keep only `membersCount` as declared data (labelled as self-reported). Drop `doctorCount`.

---

## 8. Doctor ↔ center membership

### 8.1 Hospital's own doctors never appear publicly — **major**
- The hospital panel approves doctors into `HospitalDoctor` (`centerDoctorsController.ts:79-84`), and Entity 360 counts them. But `getHospital` (`publicController.ts:1813-1850`) does not populate `doctors` or `departments`. `HospitalPage.tsx:52-106` builds its doctors and specialities **only** from the doctors of the linked `HospitalClinic` clinics.
- The specialities list is also not deduplicated (`HospitalPage.tsx:52-62`), and the section list hardcodes "clinics" even when there are none (`:70`).
- **Fix:** Populate `doctors.doctor` (active) and `departments` in `getHospital`. Merge them with the clinic doctors, dedupe, and render with `DoctorCardAlt`. [PD: are HospitalClinic clinics and hospital departments both needed? This is another concept modelled twice.]

### 8.2 A deleted clinic crashes the hospital page — **blocker** (bad-data guard)
- Clinics are hard-deleted through `/auto/clinic` (`autoController.ts:60`) with no cascade. The `HospitalClinic` row remains, `populate` returns `clinic: null`, and then `HospitalPage.tsx:54,88,136` and `HospitalPageClinics.tsx:18` call `el.clinic.doctors`, which throws a TypeError.
- The same missing cascade leaves `ClinicDoctor`, `DoctorJoinClinicRequest`, `ClinicProfileLicense` and `Office.clinic` dangling. Deleting an Insurance leaves ids in `clinic.insurances` and in `DoctorInsurance`.
- **Fix:**
  - Filter nulls on the frontend: `data.clinics.filter(c => c.clinic)`.
  - On the backend, add cascade hooks, or soft-delete (deactivate) centers instead of removing them.
  - Also filter `clinics` to active clinics.

### 8.3 Inactive doctors are listed on center pages — **major**
- `getClinic`'s pipeline (`publicController.ts:1558-1636`) and `getHospital`'s populate (`1826-1834`) never match `active: true` on `doctorprofiles`. The same applies to `insurances` (no `active` filter, at `1603-1609` and `1835`) and tags (no `isActive` filter).
- **Fix:** Add `{ $match: { active: true } }` inside the lookups and `match: {active: true}` on the populates.

### 8.4 A doctor who left a clinic can never rejoin it — **major**
- `submitAJoinClinicRequest` rejects the request when **any** request for that doctor and clinic exists (`doctorController.ts:620-624`), and a unique index backs this (`Models/DoctorJoinClinicRequest.ts:47`). After `leaveClinic` (`:694-709`) or the center's `removeMyDoctor`, the old request stays "Approved". `resubmitJoinClinicRequest` only handles "Rejected". The hospital path has the same bug (`:822`).
- **Fix:** On leave or remove, set the request to a terminal "Left" state (or delete it). Let submit reuse a non-Pending request by resetting it to Pending.

### 8.5 Centers cannot invite doctors, so the "invited" list is always empty — **major** [PD]
- `CenterDoctorsPage.tsx:44-85` renders `outgoing` (invites sent by the center), and the doctor side can answer them (`doctorController.toggleJoinClinicRequestStatus`, `:547-573`). But `clinicRouter`/`hospitalRouter` have no invite endpoint. Only the super admin can create such rows through `/auto/doctorjoinclinic`.
- **Why wrong:** Doctolib Pro and Practo Ray let a practice add its practitioners.
- **Fix:** Add `POST /clinic/doctor/invite {doctor}` (and the hospital equivalent) with duplicate checks and a notification.

### 8.6 Admin "approve join request" creates the membership but leaves the request Pending — **major**
- `FE Components/Admin/DoctorJoinClinic/EditDoctorJoinClinicStatusPopup.tsx:35-44` POSTs `/auto/clinicdoctor` and never updates the request. The clinic still sees the request in its inbox and can "reject" a doctor who is already a member.
- **Fix:** Use a backend endpoint that upserts the membership and sets `status: Approved`. Do the same for hospital.

### 8.7 Clinic specialities come only from departmented doctors — **minor**
- `getClinic` computes `specialities` from `departments[].doctors` (`publicController.ts:1637-1659`). Doctors approved through the panel have no department (`centerDoctorsController.ts:80-84`), so their specialities never show. Compute from the top-level `doctors` instead.

---

## 9. Labs (paraClinic / test)

### 9.1 Lab test prices can be negative or zero — **major**
- `paraClinicController.ts:553,580`: `price: z.coerce.number().optional()` has no `min`, and the model defaults to 0 (`Models/ParaClinicTest.ts:18`). A test can be shown at "0 toman" and added to the cart free, or at a negative price.
- **Fix:** Use `z.coerce.number().int().positive()` and make `price` required.

### 9.2 Deactivated tests still appear on lab pages — **minor**
- `getParaClinic` populates `tests.test` without `match: {isActive: true}` (`publicController.ts:1913-1916`). `addMyTest` does check `isActive` (`paraClinicController.ts:564`).

### 9.3 No test → labs discovery; tests are not in search facets or the sitemap — **major** [PD]
- See 6.1. The benchmark says diagnostics is the profitable segment and home sampling is on the 9–18-month roadmap. The `onPremises` flag exists but nothing filters on it.

---

## 10. Base*License (clinic, hospital, paraClinic, pharmacy, insurance)

### 10.1 Inactive plans can be bought by id — **major**
- `purchaseLicense` in all five controllers loads `Base*License.findById(nodeId)` with no `isActive` check (`clinicController.ts:537`, hospital, pharmacy, paraClinic and `InsuracneController` at the same line in each).
- **Fix:** `findOne({_id: nodeId, isActive: true})`. Apply the same filter to `getLicenseById`.

### 10.2 License purchase: wrong wallet charged, and the balance check has a race — **major**
- `clinicController.ts:567-578` charges `req.user`'s wallet. When a secretary buys (the route is `useClinic()` with no action, so secretaries pass), **the secretary's personal wallet pays** for the clinic's plan.
- The check-then-`$inc` is not atomic, so two parallel requests can overdraw the wallet.
- **Fix:** Charge the org owner's wallet (`req.clinic.user`) or an org wallet, and restrict purchases to the owner or to an ACL action. Use `findOneAndUpdate({_id, balance: {$gte: price}}, {$inc: {balance: -price}})`.

### 10.3 Pricing and uniqueness are not validated — **minor**
- `BaseLicensePricing.ts:27-28`: `price`/`discount` have no `min`, and discount can exceed price. Purchase clamps the result to 0, which silently gives the plan away for free.
- `isDefault`/`isPrimary` uniqueness is "not DB-enforced" (`BaseClinicLicense.ts:28-30`).
- The hospital and insurance module lists have no "doctors" module, but their panels have a doctors page (clinic too). The module gating therefore does not cover the membership features. [PD]

---

## 11. Misc

- `autoRouter.ts:477` has a copy-paste error: the insurance editBodyMutator parses `"insurances"`. It is harmless.
- `filterBookingClinic` and `filterBookingPharmacy` call `new mongoose.Types.ObjectId(el)` on unvalidated query strings (`publicController.ts:3735,3811,3829,3940`). Bad input returns a 500 instead of a 400.
- Notifications to applicants and doctors are hardcoded Persian strings (`adminEntityController.ts:300-304`, `centerDoctorsController.ts:91-96`). Users in the 14 other locales receive Persian. They should go through a TextContent key.
- `filterBookingClinic` does not support category, tag, 24h or insurance filters (`publicController.ts:3680-3697`), even though these fields exist on Clinic.

---

## Priority list

1. **Blockers:**
   - Fake data on cards and doctor rows: 5.1, 5.2, 7.2.
   - Broken or missing admin actions: 1.1 (become approvals), 2.1 (create-from-request cast error), 2.2 (pharmacy additions invisible).
   - 6.1 (TestCard 404).
   - 3.1 (empty hospital sitemap).
   - 8.2 (hospital page crash).
2. **Major:**
   - Center pages and booking: 5.3, 8.1, 8.3, 6.3.
   - Membership: 8.4, 8.5, 8.6.
   - Transitions and inputs: 1.2, 1.3, 9.1.
   - Licenses: 10.1, 10.2.
3. **Product decisions:**
   - Tags as facets or deletion (4.1).
   - An insurance acceptance model plus filter (7.1).
   - The pharmacy data model (3.2).
   - The test → labs flow (6.1, 9.3).
   - Hospital: HospitalClinic vs departments/doctors (8.1).
   - A single owner concept (3.3).
   - Centers on the map (6.2).
