# NoyanAI logic audit: the DOCTOR domain

Scope: the super-admin sections `speciality`, `specialityCategory`, `doctor`, `doctorprofile`, `service`, `serviceCategory`, `servicePackage`, `doctorfaq`, `doctorFeedback`, `bookingDescription`, `becomedoctor`, `doctorjoinclinic`, `doctorjoinhospital` and `baseDoctorLicense`, plus every public page and endpoint that shows the same data.
Mode: read-only audit (2026-09-29); the status table below was re-checked and the open items fixed on 2026-10-07.
Paths: `FE` = `/home/user/noyanaitest`, `BE` = `/home/user/noyanaitest-back`.

Severity: **blocker** (data leak, broken core flow, or money at risk) / **major** (wrong behaviour users or admins will hit) / **minor** (cosmetic, dead code, or polish).
`[PD]` = the fix needs a product decision.

## Status (re-checked against the code on 2026-10-07)

`fixed` = done in a later PR, `fixed now` = fixed in the doctor-profile pass of 2026-10-07, `open` = still to do, `[PD]` = waits on a product decision.

| Item | Status |
|---|---|
| §0 two doctor entities | fixed: legacy `Doctor` merged into `DoctorProfile` at boot (`BE Lib/mergeLegacyDoctors.ts`, `claimed:false`, `legacyDoctor`); `/doctor/<slug>` 301s to `/dr/<slug>` (`getDoctor`); `/doctors` 301s to `/book`; the legacy admin entry is read-only |
| 1.1a / 1.1b badge colours | fixed (`DoctorCardAlt` reads each type) |
| 1.1c recommend count | fixed (`DoctorProfile.recommendCount`, `recalcDoctorFeedbackStats`) |
| 1.1d always-on online dot | fixed (removed from the card) |
| 1.1e visit types differ by page | fixed now: one server rule, `BE Lib/doctorOffer.ts` (on with a price AND a shift at an active office), written as `sessionTypes` + `bookable` on every card list (home, speciality slider/list/page, search, map, disease/drug/symptom, clinic/hospital members, `/book`) and on `/public/doctor/:id/config` for the profile page |
| 1.1f TODO comment | fixed |
| 1.2 A-L other doctor cards | fixed (A, G-K deleted; B-F use `DoctorCardAlt` `grid`/`row`; L guarded) |
| 1.2 M patient "rebook" chip | open, minor, acceptable as a chip |
| search modal / speciality slider fields, `perDocumentLimit` | fixed (and now also the header-search speciality preview) |
| 2.3a apply request to new profile | fixed (`adminEntityController.approveBecomeDoctor` maps geo + specialities) |
| 2.3b IRIMC title → speciality | fixed (`Lib/specialityMatch.ts`); fixed now for the claim path too (an old page with no speciality gets the council's) |
| 2.3c clone from legacy | fixed (popup removed; merge does it) |
| 2.3d speciality invariant | fixed (normalise hooks); fixed now: a page cannot be published without first name, last name and one speciality (`DoctorProfile` save + update hooks) |
| 2.3e / 2.3g speciality category | fixed (SpecialityCategory removed; specialities stand alone) |
| 2.3f "Specialty group" label | fixed |
| 2.3h options order | fixed |
| 3.1a-b nameless speciality, blank slug | fixed (`name` required, blank slug unset) |
| 3.1c speciality delete guard | fixed (`specialityRemoveGuard`) |
| 3.1d slider populate | fixed |
| 3.1e two counts | fixed (both count active profiles) |
| 3.1f dead "about" button | fixed (`#about`) |
| 3.1g "most viewed" label | fixed |
| 3.1h unbounded speciality doctors | fixed (limit + sort) |
| 3.1i `Sepciality` ACL key | open, minor (persisted key; needs an ACL migration) |
| 3.2a national ID leak | fixed (`select:false` + `Lib/stripPrivateFields.ts` on `/public`) |
| 3.2b inactive profile public | fixed |
| 3.2c `/dr` metadata + JSON-LD | fixed |
| 3.2d secondary specialities | fixed |
| 3.2e `services` strings vs Service | fixed (owner decision 2026-10): the profile holds `serviceCategories` (ServiceCategory refs) picked with the creatable NodesSelector; a doctor-added entry is live on their page and pending review (approve / merge in the admin services hub, «پیشنهادهای پزشکان»); old strings converted at boot (`Lib/migrateDoctorServices.ts`); `/book` filter, text query, header search and clinic filter read the same refs |
| 3.2f admin city column | fixed |
| 3.2g PhoneConsultSettings | fixed (tab removed); open minor: `allPopulation` still loads it |
| 3.2h slug unique | fixed (unique sparse index, friendly duplicate error) |
| 3.2i `medicalSystemTitle` not in schema | fixed now (schema field; copied on approval) |
| 3.2j geo cascade | fixed (the panel checks city ∈ province; location follows offices) |
| 3.2k derived counters editable | fixed (`protectedFields`) |
| 3.2l delete with dependants | fixed (`doctorProfileRemoveGuard`) |
| 3.2m legacy form speciality | fixed (merge) |
| 3.2n funnel to `/doctors` | fixed (redirect); fixed now: footer links straight to `/book` |
| 3.3a ePresc filter | fixed |
| 3.3b dead `filterBooking` v1 | fixed (removed) |
| 3.3c sort vs shown fields | open, minor |
| 3.3d search by speciality | fixed; fixed now: full name ("سارا محمدی"), council code and speciality match in both the header search and `/book` (`doctorQueryMatch`) |
| 3.4a approve does nothing | fixed; fixed now: approval no longer force-publishes (a draft that goes live when bookable, as self sign-up; a suspended profile no longer makes approval fail) |
| 3.4b two onboarding flows | open [PD] (`getMyBecomeDoctorRequest` still returns McCode rows) |
| 3.4c request geo slugs | open, minor (mapped on approval by `resolveGeo`) |
| 3.4d national ID shown to reviewers | open [PD] (needed to verify identity) |
| 3.5a / 3.5b admin join decision | fixed (`decideDoctorJoin`, invitations left to the doctor) |
| 3.6a-c feedback bounds, recommend, access | fixed |
| 3.7a doctor FAQ moderation | open [PD] |
| 3.7b admin FAQ doctor picker | open, minor |
| 3.8a package summary | fixed |
| 3.8b `inventory` unread | open, minor |
| 3.8c price/discount | fixed |
| 3.8d package items owner | fixed (`packageItemsOwned`, panel check) |
| 3.8e inactive owner's services | fixed; fixed now: the "special" services strip too |
| 3.8f-g product tables / field names | open, minor |
| 3.8h service access levels | fixed |
| 3.9a unused `descriptions` prop | open, minor |
| 3.10a-d licence purchase | fixed (active tier only, atomic debit in `Lib/licenseQuote.ts`, single default, minimal modules with no default) |

### New findings of the 2026-10-07 pass (all fixed now unless marked)
| # | Where | Was | Now | Sev |
|---|---|---|---|---|
| N1 | `BE Lib/doctorPublish.ts` | Auto-publish counted "an office" and "a shift" separately: an inactive office, or a shift holding only a switched-off type, published a page nobody could book | Uses `doctorOffers` (bookable type = on + price + shift at an active office); the panel's setup checklist (`getMyDashboard`) uses the same `doctorReadiness` | major |
| N2 | `FE DoctorCardAlt` | "Book" shown for every claimed doctor, even one with no office, hours or visit type | Follows the server's `bookable`; otherwise "no online booking" | major |
| N3 | `BE filterBooking2` visit-type filter | Matched shifts only: a doctor with video in a shift but video switched off was listed under "video" | `doctorsOffering` | major |
| N4 | `BE getSpeciality` | `sessionTypes` = union of shifts, ignoring the settings | the shared rule | major |
| N5 | `DoctorProfile.medicalSystemCode` | No uniqueness: two profiles with one council code (double listing, the claim picked one at random) | A changed code that another profile holds is refused (save + update hooks; old duplicate pairs don't block other edits) | major |
| N6 | `/dr` page + booking panel | Visit-type tags and choices from the `active` flag only (a type with no hours led to an empty slot picker); inactive offices on the map/address; FAQ tab with no FAQ block | `config.sessionTypes`; offices `active:true`; FAQ tab only with FAQs | minor |
| N7 | verified tick | Drawn on every card, including imported directory profiles; the profile page used another rule | One rule on card and page: an account (`claimed`) with a council code on record; the page also shows the council number (Paziresh24 / Doctolib) | minor |
| N8 | `getDoctorProfile` | Populated the whole McCode (its account id) | `mcCode` + `title` only | minor |
| N9 | website, land line, social links | The panel lets the doctor fill them; no public page shows them | open [PD]: show them (Doctolib shows a practice phone, Paziresh24 hides it to keep bookings on-platform) or drop the fields | minor |
| N10 | `DoctorProfile.tier` | No form sets it since the education filter was removed | open, minor: drop the field or give it a source | minor |
| N11 | patient booking vs the doctor's plan licence | A doctor whose plan expired falls back to the default tier and stays bookable | open [PD]: decide whether an expired plan hides booking | minor |

---

## 0. The root cause behind most findings: two doctor entities

| | `Doctor` (legacy directory) | `DoctorProfile` (registered, bookable) |
|---|---|---|
| Model | `BE/Models/Doctor.ts` | `BE/Models/DoctorProfile.ts` |
| Name | `name` (one string) | `firstName` + `lastName` |
| Photo | `image` | `avatar` |
| Speciality | `speciality` + `specialities[]` | `mainSpeciality` + `specialities[]` |
| Geo | `province`/`city` = **slug strings**; `lat`/`lng` = strings | `province`/`city`/`district` = **ObjectId refs** to `Geo/*`; `location` = GeoJSON point |
| Public URL | `/doctor/[slug]`, listed at `/doctors` | `/dr/[slug]`, listed at `/book`, on the homepage, and in search |
| Admin menu | "پزشکان" (`adminMenu.tsx:68`) | "پروفایل پزشکان" (`adminMenu.tsx:69`) |
| Can be booked | no | yes |

There is also a third list, `old/doctor` (`adminMenu.tsx:315`).
`getSpeciality` merges both collections with `$unionWith` (`BE/Controllers/publicController.ts:1098-1140`), so the frontend has to pick a card by `model`. That is the direct cause of complaint #1.
Every leader (Doctolib, Zocdoc, Docplanner, Paziresh24) models this as **one** provider entity with a `claimed/bookable` flag. An unclaimed profile is shown with the same card and a "not bookable online" state (Paziresh24 shows «نوبت‌دهی اینترنتی ندارد»).

---

## 1. Complaint 1: "Doctor cards exist in two designs"

### 1.1 The homepage card (the reference)
`FE/Components/UI/DoctorCardAlt.tsx`
- Used on the homepage (`Components/Home/HomePopular.tsx:48`, `Components/Home/HomeSpecialities.tsx:69`).
- Also used, correctly, on `Speciality/SpecialityPage.tsx:116` (DoctorProfile rows only), `Disease/DiseasePage.tsx`, `Drug/DrugPage.tsx`, `Symptom/SymptomPage.tsx`, and `Layout/SearchModal.tsx:267`.

**The reference card has bugs of its own.** Fix these before every other card is pointed at it:

| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| 1.1a | `DoctorCardAlt.tsx:128-135` | The chat badge is coloured by `videoCallSettings` | Use `textChatSettings` | major |
| 1.1b | `DoctorCardAlt.tsx:147-166` | The "In person" and "SIP call" badges are also coloured by `videoCallSettings` | Use `inPersonSettings` and `sipCallSettings` | major |
| 1.1c | `DoctorCardAlt.tsx:63-71` | "N people recommended" shows `feedbackCount`, which counts all approved reviews, including those with `suggest:false` | Store a `recommendCount` on DoctorProfile (in `recalcDoctorFeedbackStats`, `BE/Models/DoctorFeedback.ts:87`), or relabel it as "N reviews" | major |
| 1.1d | `DoctorCardAlt.tsx:79` + `.module.css:60-68` | The green "online" dot is always drawn, for every doctor | Show it only for a real presence signal, or remove it | major (fake data) |
| 1.1e | `DoctorCardAlt.tsx:104-168` | The badges come from the `*Settings.active` flags only. The booking card (`filterBooking2`, `BE publicController.ts:3499-3561`) also requires a shift that covers the type. So the same doctor shows different visit types on the homepage and on `/book`. | Compute `sessionTypes` on the server once (a shared helper) for home, speciality, search and disease, and render from `sessionTypes` | major |
| 1.1f | `DoctorCardAlt.tsx:56-58` | `//TODO : claculate this` comment next to the score | Remove it; the value is real now (`averageScore`) | minor |

### 1.2 Every other component that renders a doctor

| # | Component | Where it is used | How it differs from DoctorCardAlt | Sev |
|---|---|---|---|---|
| A | `FE/Components/Doctor/DoctorCard.tsx` | `/doctors` and `/doctors/[page]` (`Doctor/DoctorsListPage.tsx:42`); legacy rows on `/speciality/[slug]` (`SpecialityPage.tsx:114`) | Legacy `Doctor` model. Reuses DoctorCardAlt's CSS but a different DOM: scores block commented out; no visit-type badges; no location; no "Book" button; links to `/doctor/${slug \|\| name}` (line 31), so a doctor without a slug gets a URL built from the name, which only resolves through the `findOne({name})` fallback. Always draws the online dot and the verified tick (64-67). **On one speciality page, the two designs sit side by side.** | blocker (the owner's complaint) |
| B | `FE/Components/Booking/DoctorCardBooking.tsx` | `/book` results (`Booking/DoctorBookingResults.tsx:37`) | Wide list/grid card with a 3-day availability strip, a share/report menu, and the location as a tag. Leaders do use a richer search-result card (Doctolib and Zocdoc add the slot strip). **[PD]:** make it a `variant="search"` of the same shared card (same identity, score and badge blocks), not a separate component. Also: "report problem" pushes to `/contact` (line 258) while `ReportProblemPopup` is imported and never used (40). The same `feedbackCount`-as-recommendations bug (244-253). | major |
| C | `FE/Components/Clinic/MedicalCenterDoctors.tsx` (`Item`, 20-54) | Clinic page (`Clinic/ClinicDoctors.tsx`), hospital page (`Hospital/HospitalPage.tsx:21`) | Small row: avatar, name, speciality. **Hardcoded score `4.9`** (line 49). **No link to the profile and no book button.** | major |
| D | `FE/Components/Clinic/MedicalCenterDepartments.tsx:79-107` | Clinic departments (`Clinic/ClinicDepartments.tsx`), hospital clinics (`Hospital/HospitalPageClinics.tsx`) | Another row design, again with a **hardcoded `4.9`** (101) and no link. `key={doctor._id}` is read before the `!!doctor` null-check (80-81), so a null entry crashes the page. | major |
| E | `FE/Components/Speciality/SpecialityCard.tsx` (`DoctorsSlider`, 26-93) | `/speciality` list | A mini doctor row: stethoscope icon instead of the avatar, **hardcoded `4.9`** (73), no link. The card also renders `<Bitches/>` (146): 6 stock photos plus a hardcoded "50", with `alt="Our Lovely User"` in English (`Booking/Bitches/Bitches.tsx`). That is fake social proof, and the component name is offensive. | major |
| F | `FE/Components/Map/MapPage.tsx` (`ResultItem` 66+, used 185-193) | `/map` | A list-item design of its own. The results header is **hardcoded `(20)`** (183). Map markers (`Map/MapInnerShit.tsx:95-106`) carry only a title: no card and no link. | major |
| G | `FE/Components/Booking/CardWithSession.tsx` | **Dead code** (only imported by `DoctorCardWithSessions.tsx`, which nothing imports) | Fake data: `98%` (60), `23490` successful appointments (76), `4.86` / `85` comments (89-92). The speciality link falls back to `speciality.name` (66), which 404s. | minor (delete) |
| H | `FE/Components/Booking/DoctorCardWithSessions.tsx` | Dead | Old session card | minor (delete) |
| I | `FE/Components/Dr/DoctorBookingCard.tsx` | Dead | Hardcoded `98%` (40) | minor (delete) |
| J | `FE/Components/Dr/PublicDrIntro.tsx`, `DrtIntroduction.tsx`, `PublicDoctorProfilePage.tsx` | Dead (the old `/dr` page; `app/dr/[slug]/page.tsx:35` keeps it commented out) | Hardcoded `98%` (82), `4.93` (126) | minor (delete) |
| K | `Booking/BookingCardList.tsx`, `BookingCardGrid.tsx`, `DoctorsCardList.tsx` | Dead | Stubs that render `<p>BookingCardList</p>` | minor (delete) |
| L | `Booking/DoctorTooltip.tsx` | `Booking/BookingMap.tsx` (itself only used by `WithSideMap.tsx`) | Plain `firstName lastName`, with no null guard | minor |
| M | `FE/Components/Dashboard/Home/PatientHome.tsx:72-80` ("rebook") | Patient dashboard | Avatar and name only. Acceptable as a compact "rebook" chip. | minor / [PD] |

**Data feeding the reference card is inconsistent too:**
- The search modal (`BE publicController.ts:2867-2881`) selects only `firstName lastName slug avatar mainSpeciality`. Because `province`, `averageScore` and `feedbackCount` are not selected, the same card in search shows score 0, the placeholder "location", and no province.
- The speciality-list slider comes from `getSpecialities`. There the `doctors` virtual is populated with `options.limit: 15` (`publicController.ts:937-941`). Mongoose applies that limit to **all specialities together**, not per speciality (`perDocumentLimit` is needed), and there is no `match: {active:true}`, so inactive doctors appear.

**Fix (one card everywhere):**
1. Fix DoctorCardAlt's own bugs (1.1a-e), move it to `Components/_Common/DoctorCard`, and give it `variant: "grid" | "row" | "search"`.
2. Add one backend helper, `doctorCardProjection` plus `attachSessionTypes(rows)` (lift the code from `filterBooking2` 3494-3561). Use it in home, specialityDoctors, speciality, disease, drug, symptom, globalSearch, searchInMap, clinic and hospital.
3. Replace A, C, D, E and F with the shared card (C, D, E and F as the `row` variant). Delete G-K.
4. After the Doctor → DoctorProfile merge (§2.4), A disappears.
Check at 1440px and 390px.

Leader pattern: Doctolib, Zocdoc and Paziresh24 use a single provider card component on the homepage, search, speciality+city landing pages and facility pages: photo, name, speciality, rating with review count, address, and the next availability. NoyanAI should copy that, and do better by showing only the visit types a doctor really offers (the shifts × settings logic that already exists in `filterBooking2`).

---

## 2. Complaint 2: "Speciality has a category with wrong logic; you should give a doctor a speciality"

### 2.1 What the models say today
- `Speciality` (`BE/Models/Speciality.ts:6-33`): `name`, `slug`, `image`, `isHome`, `order`, `summary`, `active`, `description`, and **`category → SpecialityCategory`** (optional, single).
- `SpecialityCategory` (`BE/Models/SpecialityCategory.ts`): `name`, `isActive`, `order`, `slug`. It knows nothing about doctors.
- `DoctorProfile` (`BE/Models/DoctorProfile.ts:72-78`): `mainSpeciality → Speciality` (single) **plus** `specialities[] → Speciality`. So a doctor *is* attached to specialities directly, and can have several. It is never attached to a category.
- Legacy `Doctor` (`Doctor.ts:79-85`): `speciality` plus `specialities[]`.
- `BecomeDoctorRequest` (`BecomeDoctorRequest.ts:74-80`): `specialities[]` (at least 1, validated in `doctorController.ts:131-143, 162-169`). It has no "main" speciality.
- Unused: `TaminSpec` (`Models/TaminSpec.ts`) already holds the official Tamin speciality codes (`specCode`, `specGRP`), but `Speciality` has no link to it.

### 2.2 Where the category is used
- The chips on the public speciality list (`getSpecialities`, `publicController.ts:924-930`; `FE Speciality/SpecialitiesPage.tsx`).
- The header mega-menu: the "Categories" tab defaults to speciality categories (`FE Layout/PublicHeader.tsx:73`) and links to `/speciality?category=<slug>` (`Layout/headerCategories.ts:45`).
- A plain label on the speciality page (`SpecialityPage.tsx:87-90`). It is not a link.
- **Not used in:** `/book` search or filters, doctor data, sitemap or SEO landing pages (only a `?category=` query page), or the Tamin mapping.

### 2.3 Why it "feels wrong" (the real defects)

| # | file:line | Now | Why wrong | Fix | Sev |
|---|---|---|---|---|---|
| 2.3a | `FE Admin/BecomeDoctor/InstantCreateDoctorProfilePopup.tsx:48-60` | "Apply the request's fields to the new profile" copies `province`/`city` as **slugs** into DoctorProfile, where they are ObjectId refs, so the create fails with a CastError whenever they are set, which is always, since they are required on the request. It also **drops `specialities`**, the one thing the doctor declared. | Approving a doctor never gives them their speciality | Map slugs to Geo ids; set `specialities = req.specialities` and `mainSpeciality = req.specialities[0]` | **blocker** |
| 2.3b | `BE doctorController.ts:356-378` `createMyDoctorProfile` (the new self-service McCode flow used by `FE DoctorPanel/BecomeADoctorPage.tsx`) | Creates the profile with **no speciality at all**. The council's speciality title (`McCode.title` = `Spec_DegreeFieldTitle`, `doctorController.ts:332-337`) is saved as free text and never mapped to a `Speciality`. | The authoritative source (IRIMC) is ignored; the doctor must find the "Details" tab | Map `McCode.title` to a Speciality (a `Speciality.irimcTitles[]` synonyms field) on create; if it can't be mapped, force the speciality picker as step 2 of onboarding | major |
| 2.3c | `FE Admin/BecomeDoctor/CloneDoctorProfileFromExistingDoctorPopup.tsx:67-79` | Clone from the legacy Doctor sends `speciality: doc.speciality?._id`, a field DoctorProfile doesn't have, so the main speciality is silently lost. It also sends slug `province`/`city` (CastError), string `lat`/`lng` without `location` (so the clone is invisible on the map and in geo filters), and the full `name` as `firstName`. | Same as 2.3a | Map to `mainSpeciality`, Geo ids and a GeoJSON `location` | major |
| 2.3d | `DoctorProfile.ts:72` + the admin `DoctorSpecialityTab.tsx:30-48` + `doctorController.ts:450-468` | `mainSpeciality` is optional, may be absent from `specialities`, or may also appear in `specialities` (both are allowed). An **active doctor can have no speciality.** | The doctor is not findable by the speciality filter; the card shows a blank speciality line; `SpecialityCard` counts main + side, so it **double-counts** a doctor listed in both (`SpecialityCard.tsx:117-122`) | Invariant: `specialities.length ≥ 1` when `active`; `mainSpeciality ∈ specialities`; enforce it in a `pre('validate')` hook and in `updateMyProfile`. The admin picker should list active specialities only (today it uses `/auto/speciality`, which includes inactive ones) | major |
| 2.3e | Admin `Speciality/AdminManageSpecialityPage.tsx:223-234` | The category is a field on the speciality page, and the admin menu puts "دسته‌بندی تخصص‌ها" under **"مراکز درمانی"** (medical centres) (`adminMenu.tsx:241`), away from the specialities themselves (`adminMenu.tsx:116`) | Confusing: the admin thinks a category is a step in the doctor ↔ speciality chain | Rename it to "گروه تخصص (فقط برای منو)". Move it next to "تخصص‌ها". Show on the speciality page the list or count of doctors who have that speciality (today the admin cannot see who is in a speciality). | minor |
| 2.3f | `FE Booking/DoctorBooking.tsx:494` (label key `specialityGroup` = «گروه تخصصی» / "Specialty group") | The `/book` filter labelled "Specialty group" actually lists **specialities** | Mislabel; it reinforces the "category" confusion | Use the key `speciality` | minor |
| 2.3g | `BE autoRouter.ts:864-871` | `specialityCategory` has no `accessLevel`, so only the `admin` role can use it. A `notadmin` with Speciality rights cannot load the category picker on the speciality page (403). | Inconsistent access | Give it `accessLevel: "Sepciality"` | minor |
| 2.3h | `BE publicController.ts:449-456` | `getSpecialityOptions` sorts `order:-1`, the reverse of every other list | The doctor panel picker is in the reverse order | `order:1, _id:1` | minor |

### 2.4 The target model (what the leaders do)
Doctolib, Zocdoc, Docplanner and Paziresh24 all attach a practitioner **directly** to one or more specialities, with one primary speciality shown on the card. Groups exist only for navigation and SEO ("Dentists" → orthodontist, endodontist…). Paziresh24 builds its landing pages as speciality + city (`docs/market-benchmark.md:19, :129`: «تخصص + شهر (+ بیمه)»).

```
Speciality        { name*, slug* (unique), active, order, image, summary, description,
                    isHome, group?: SpecialityGroup, taminSpecCode?: string,
                    synonyms: string[] (IRIMC titles, lay terms for search) }
SpecialityGroup   { name*, slug*, order, isActive }        // = today's SpecialityCategory, navigation only
DoctorProfile     { specialities: Speciality[] (min 1 when active, unique),
                    mainSpeciality: Speciality (must be in specialities),
                    claimed: boolean, bookable: boolean, ... }   // absorbs legacy Doctor
```
- The group is **never** used on a doctor. It is used only for the header menu, the `/speciality` chips, and optional `/speciality/group/<slug>` landing pages.
- `taminSpecCode` lets the e-prescription flow use the doctor's own speciality code, instead of the hardcoded `specCode: "00100"` (`prescriptionController.ts:1161`).
- Search: `globalSearch` and `filterBooking2 ?query=` should also match `Speciality.name` and `synonyms`. Today "قلب" finds the speciality but not the cardiologists.

What NoyanAI copies: a doctor has several specialities and one primary. What it changes: the group is renamed and demoted to navigation only. What it does better: automatic mapping from the IRIMC/McCode title, and a link to the Tamin speciality code for e-prescription.

### 2.5 Data migration plan (one idempotent script in `BE/Controllers/migrationController.ts` or `scripts/`, dry-run first)
1. **Back up** `doctorprofiles`, `doctors`, `specialities`, `specialitycategories`, `becomedoctorrequests`, `galleryitems`, `comments` and `redirections`.
2. **Clean dangling refs:** set `Speciality.category` to null where the category no longer exists. Set `DoctorProfile.mainSpeciality` to null, and pull unknown ids from `specialities`, where the Speciality was deleted (deletes have no guard today, see 3.1c). Do the same for `Disease.specialities`.
3. **Normalise DoctorProfile:** `specialities = unique([mainSpeciality, ...specialities].filter(Boolean))`. If `mainSpeciality` is null and `specialities` is not empty, set `mainSpeciality = specialities[0]`.
4. **Back-fill from requests:** for profiles with `specialities=[]`, copy `BecomeDoctorRequest.specialities` of the same `user`.
5. **Suggest from IRIMC:** for profiles still empty, match `McCode.title` against `Speciality.name` and `synonyms`. Write the matches to a report for the admin; do not auto-apply fuzzy matches.
6. **Report the leftovers** (active profiles with no speciality) as a CSV for the admin. **[PD]:** deactivate them automatically or not.
7. **Merge legacy `Doctor` into `DoctorProfile`** (`claimed:false, bookable:false, legacyDoctorId`). Map the fields:
   - `name` → `firstName`/`lastName` (split on the last space, and keep `displayName`)
   - `image` → `avatar`
   - `speciality`/`specialities` → as in step 3
   - `province`/`city` slugs → Geo ObjectIds via `Province`/`City.slug`
   - `lat`/`lng` → `location`
   - `summary`/`description` → `introduction`
   - socials → `DoctorSocialMedia`
   - `GalleryItem.owner` → re-pointed
   - `Comment` rows with `model:"Doctor"` → re-pointed

   Keep the slug when it is free; otherwise add a suffix. Insert a `Redirection` from `/doctor/<old>` to `/dr/<new>` for each one.
8. **Dedupe `DoctorProfile.slug`,** then add a unique sparse index (none today: `DoctorProfile.ts:91`, `Doctor.ts:53`).
9. **Rename the collection and model** `SpecialityCategory` → `SpecialityGroup` (optional; you can keep the collection name and relabel only the UI). Update `translatableFields.ts:64` and `slugGenerationService.ts:73`.
10. **Switch the readers:** `/public/doctor` (list and page) and `getSpeciality`'s `$unionWith` read only DoctorProfile. Map the `/doctors` route to the unified list, or 301 it to `/book`. Remove the "پزشکان" (Doctor) admin menu entry once the migration is verified.

---

## 3. Other defects by section

### 3.1 speciality / specialityCategory
| # | file:line | Now | Why wrong / fix | Sev |
|---|---|---|---|---|
| a | `FE Admin/Speciality/NewSpecialityPopup.tsx:19-23`; `Speciality.ts:21` | "New" POSTs `{}` immediately, creating a nameless speciality. `name` is not required. | Invalid state. Open a form, and make `name` and `slug` required. | minor |
| b | `Speciality.ts:22` | The slug is `unique, sparse`, but an empty string `""` is not skipped by `sparse`, so a second blank slug fails with E11000 | Normalise `""` to unset | minor |
| c | `BE autoRouter.ts:224-233` (remove) | Deleting a Speciality has no guard, which leaves dangling `DoctorProfile.mainSpeciality/specialities`, `Disease.specialities` and `BecomeDoctorRequest.specialities`. The same holds for SpecialityCategory. | Block the delete while it is referenced, or use soft-delete (`active:false`) | major |
| d | `BE publicController.ts:937-941` | The `doctors` populate on the speciality list: a global `limit` instead of `perDocumentLimit`, and no `active` match | Wrong or empty sliders; inactive doctors shown | major |
| e | `FE Speciality/SpecialityCard.tsx:117-122` vs `SpecialityPage` `count` | The list card counts main + side (double count, includes inactive, excludes legacy); the detail page counts both collections, active only | The two counts disagree | Use one count (the distinct active DoctorProfiles) | minor |
| f | `FE Speciality/SpecialityPage.tsx:93-101` | The "About this speciality" button has no `onClick` or `href` | Dead button. Scroll to the `RenderRtf` description (126). | minor |
| g | `FE Home/HomeSpecialities.tsx:86` | The title "mostViewedSpecialities" shows the admin `isHome` pick, not views | Mislabel: fake claim | minor |
| h | `BE publicController.ts:294-330` `getSpecialityDoctors` | No `limit` and no `sort`; returns every doctor of the speciality with full documents | Unbounded payload on the homepage; order is random | major |
| i | `BE Models/AccessLevel` key `"Sepciality"` (e.g. `autoRouter.ts:232`) | A typo baked into persisted ACL data | Migrate the key to `Speciality` | minor |

### 3.2 doctor (legacy) / doctorprofile
| # | file:line | Now | Why wrong / fix | Sev |
|---|---|---|---|---|
| a | `BE publicController.ts:201-214` (home popularDoctors), `294-313`, `1098-1150` (`getSpeciality` aggregate, no `$project`), `2385-2407` (`getDoctorProfile`), `2410-2438`, `3452` (`filterBooking2` rows), `2046-2066`/`2130` (`Service.owner` populated in full), `2869` | **The full DoctorProfile document is public, including `ssid` (the national ID, set from `UserIdentity.nationalId` at `doctorController.ts:374`) and `user` (an account id).** No `select:false` and no toJSON transform (checked: none in Lib or app.ts). | Personal data leak (the national code of every registered doctor) | Add `ssid: {select:false}` in the schema, plus one `PUBLIC_DOCTOR_FIELDS` projection used by every public endpoint and every aggregate `$project` | **blocker** |
| b | `BE publicController.ts:2396-2398` `getDoctorProfile` | No `active:true` filter. Deactivated or unapproved profiles stay public at `/dr/<slug\|id>`. The same applies to `getDoctorAvailabilities` (2446) and `getDoctorConfig` (688). | Admin "deactivate" does not hide the doctor | Filter on `active:true` | major |
| c | `FE app/dr/[slug]/page.tsx` | **No `generateMetadata` and no JSON-LD** on the bookable profile page, while the legacy `/doctor/[slug]` has both (`app/doctor/[slug]/page.tsx:15,33`) | SEO is invested in the wrong entity. Add metadata and a `Physician` schema (name, medicalSpecialty, aggregateRating from approved reviews). | major |
| d | `BE publicController.ts:2389-2395` | `/dr` does not populate `specialities`; the page shows only `mainSpeciality` (`NewPublicDoctorProfilePage.tsx:237`) | Secondary specialities are invisible to patients | Populate and render them as badges linking to `/speciality/<slug>` | minor |
| e | `DoctorProfile.ts:81` `services: string[]` vs the `Service` model (`owner → DoctorProfile`) | Two "services" concepts. The profile section "تخصص و خدمات" shows the free-text strings; the `/book` "service" filter searches `Service.category` (`filterBooking2` 3308-3331). | A doctor who lists "بوتاکس" in the profile is not found by the service filter | **[PD]:** keep free-text "visit reasons" (as Doctolib does) but source the filter from them, or drop the strings and use the Service catalog | major |
| f | `FE Admin/DoctorProfile/AdminManageDoctorProfilesPage.tsx:92-94` | The City column does `cities.find(c => c.slug === node.city)`, but `city` is an ObjectId and is not populated in `allPopulation` (`autoRouter.ts:309-313`) | The column is always empty; the filter filters nothing | Populate `city` and show `city.name` | minor |
| g | `…ProfilesPage.tsx:110-125`; admin profile tab "مشاور تلفنی" (`AdminManageDoctorProfilePage.tsx:111-116`) | The admin sees and edits only the legacy `PhoneConsultSettings` (`phone`). The five visit types doctors really use (`inPerson`, `voiceCall`, `videoCall`, `sipCall`, `textChat`), shifts and offices are not visible. | Duplicate concept (phone vs voiceCall/sipCall) | **[PD]:** retire `PhoneConsultSettings`; show a read-only "visit types and prices" tab | major |
| h | `DoctorProfile.ts:91` / `Doctor.ts:53` | `slug` has no unique index; the admin can type any slug (`DoctorProfileInfoTab.tsx:39`) | Duplicate slug means `findOne({slug})` returns an arbitrary doctor | Unique sparse index plus validation | major |
| i | `DoctorProfile.ts:31` (interface) vs schema | `medicalSystemTitle` is in the interface but not in the schema, so it is silently dropped (e.g. by 2.3a) | A field nobody saves | Add it to the schema (it is needed to show «دندانپزشک / پزشک / ماما») | minor |
| j | `FE DoctorProfileInfoTab.tsx:62-90` | Province, city and district are independent pickers; a city from another province is accepted (on the backend too, `autoController.edit` has no validation) | Invalid geo | Cascade the pickers, plus a server check | minor |
| k | `BE autoRouter.ts:302-323`; `autoController.ts:52` | `findByIdAndUpdate` without `runValidators`, and there is no `editSchema`: the admin can write `averageScore`, `feedbackCount`, `ssid`, `user` and so on | Counters that should be derived can be overwritten | Add an `editSchema` allowlist | minor |
| l | Remove a DoctorProfile (`autoRouter.ts:302`) | No cascade and no guard: Services, ServicePackages (`owner` required), ClinicDoctor, reviews and reservations are left dangling. Public `getServices` then lists services with `owner:null`. | Soft-delete (`active:false`) instead of a hard delete, or block the delete when related data exists | major |
| m | `FE Admin/Doctor/AdminManageDoctorInfoTab.tsx:31-60` | The legacy Doctor admin form has **no speciality field** (the list shows `speciality` at `AdminManageDoctorsPage.tsx:128`, but it cannot be edited) | Resolved by the merge in §2.5 | minor |
| n | `FE Home/HomeHero.tsx:55`, `Dashboard/Home/PatientHome.tsx:192` ("book"), `Dashboard/Booking/DashboardManageBookingsPage.tsx:205,232` ("new booking"), `Layout/SearchModal.tsx:268` ("see all doctors") | All point to `/doctors`, the **legacy, non-bookable** directory that does not contain registered DoctorProfiles | A broken booking funnel: the patient clicks "book" and lands where nothing is bookable | Point them to `/book` (and after the merge, `/doctors` → `/book`) | **blocker** |

### 3.3 Search and booking (`/book`) where they touch the doctor domain
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `BE publicController.ts:2981-2984, 3049, 3176` | `ePresc` is parsed and **ignored** by `filterBooking2`; the UI toggle (`DoctorBooking.tsx:247, 695-704`) filters nothing | Filter on doctors with a valid `DoctorTaminCred` (or a `DoctorProfile.ePrescription` flag) | major |
| b | `BE publicController.ts:3029-3155` `filterBooking` (v1) | Dead endpoint with typos (`manSpeciality`, `specialties`), a Set passed to `$in`, `category: {$in:[array]}`, and no pagination. The frontend uses `filterBooking2` only; `getBookingPage` (516) is unused too. | Delete both | minor |
| c | `filterBooking2` 3406-3437 | Sorting uses aggregated `averageRatings`/`recommendationsCount`, while the card shows the stored `averageScore`/`feedbackCount` | Sort and display from the same stored fields, and add `recommendCount` | minor |
| d | `globalSearch` 2867-2881 | Doctors are matched by name only; not by speciality or synonyms. Fields the card needs are not selected (see §1). | Also match the doctor's speciality ids for specialities that match the query | major |

### 3.4 becomedoctor
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `FE Admin/BecomeDoctor/ChangeBecomeDoctorStatusPopup.tsx` + `autoRouter.ts:234-244` | "Approve" only flips `status`. It creates no profile and sends no SMS; the profile is a separate manual step in the "پروفایل" tab. | An action that doesn't do what its label says. On approve, create or link the DoctorProfile (with the speciality, see 2.3a) and notify the doctor. | major |
| b | `BE doctorController.ts:200-207` `getMyBecomeDoctorRequest` | Returns `McCode` documents, not the request | Misnamed; there are **two onboarding flows** (the BecomeDoctorRequest form vs McCode self-service). **[PD]:** keep one. Leaders verify the licence against the regulator; here, IRIMC via McCode. | major |
| c | `BecomeDoctorRequest.ts:81-82` | `province`/`city` are legacy slug enums (`Lib/Provinces`) while DoctorProfile uses the Geo collections | Two geo systems | Migrate the request to Geo ids | minor |
| d | Admin `BecomeDoctor/AdminManageBecomeDoctorPage.tsx:71` | The national ID (`ssid`) is shown in plain text to any role with `BecomeDoctorRequest:readOne` | Mask it by default | minor |

### 3.5 doctorjoinclinic / doctorjoinhospital
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `FE Admin/DoctorJoinClinic/EditDoctorJoinClinicStatusPopup.tsx:35-45` (and the Hospital twin, line 36) | The "ویرایش وضعیت" (edit status) button **creates a `ClinicDoctor` and never updates the request.** The request stays `Pending` forever; a second click returns E11000 (500) on the unique index (`ClinicDoctor.ts:26`); there is no reject path. | One backend action, `approve/reject`, that upserts the link and sets `status` and `statusLastChangedAt` (as `doctorController.ts:563-572` already does for the doctor side) | major |
| b | Same | The admin approves on behalf of the clinic/hospital even when `submissionParty` is the doctor, bypassing the clinic's consent | **[PD]:** decide whether the admin may override | minor |

### 3.6 doctorFeedback
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `BE Models/DoctorFeedback.ts:38-57` | Scores have no `min:1,max:5` in the schema (only in the user controller's zod) | Add schema bounds | minor |
| b | `DoctorFeedback.ts:87-107` | The stats recompute stores the average and count but not the recommend count, which feeds bug 1.1c | Add `recommendCount` | major (see 1.1c) |
| c | `autoRouter.ts:1003-1020` | Good: only `status` is editable. There is no `accessLevel`, so only `admin` can moderate (not `notadmin` staff). | **[PD]** | minor |

### 3.7 doctorfaq
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `BE publicController.ts:2399-2402` | Doctor-authored FAQs (`doctor: <id>`) go public with no moderation, while the admin moderates reviews | **[PD]:** the same moderation as reviews | minor |
| b | `FE Admin/DoctorFaq/CreateDoctorFaqPopup.tsx:15-18` | The admin can only create global FAQs (no doctor picker) and cannot re-assign one | Add an optional doctor picker | minor |

### 3.8 service / serviceCategory / servicePackage
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `BE Models/ServicePackage.ts:20` vs schema 33-69 | `summary` is in the interface and in the admin form (`AdminManageServicePackagePage.tsx:73`) but **not in the schema**, so every save silently drops it | Add it to the schema | major |
| b | `Service.ts:16,39` `inventory` | Editable in the admin (`AdminManageServicesPage.tsx:101`) but never read or decremented (`cartController.ts:230-290`) | A field nobody reads. Remove it, or implement capacity. | minor |
| c | `Service.ts:37-38`, `ServicePackage.ts:45-46` | `price`/`discount` have no `min:0`, and `discount ≤ price` is not checked (the cart clamps to 0, so a 100% discount is possible by mistake). The unit is not labelled on the Service form (the package form has `price:true`). | Validate the values and label the unit (toman vs rial, consistent with the rest of the site) | major |
| d | `ServicePackage` price | The package price is typed by hand and is independent of the included services; the included services are not checked to have the same `owner` (the picker filters by owner, the API does not) | Server check that `services[*].owner == owner`; show the sum of the item prices | minor |
| e | `BE publicController.ts:2026-2031, 2120-2140` | Public services and packages do not require `owner.active`, so a deactivated doctor's services stay listed and purchasable (`cartController.ts:260` checks only `isActive` of the item) | Also require an active owner | major |
| f | `Service.ts:65-75`, `ServicePackage.ts:73+` | The `specs`/`images` virtuals point to `ProductSpec`/`ProductImage` with `foreignField:"product"` | Services share the product tables; an id collision is unlikely but the coupling is wrong. Rename the field to `owner` + `ownerModel`. | minor |
| g | `ServiceCategory.ts:16` `title` vs `SpecialityCategory.name` | Inconsistent field names for the same concept | Align the names | minor |
| h | `autoRouter.ts:659-669, 719-726, 966-976` | service, serviceCategory and servicePackage have no `accessLevel` (admin only) and no `editSchema` | **[PD]** | minor |

### 3.9 bookingDescription
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `FE Booking/DoctorBookingResults.tsx:24,32` | The `descriptions` prop is accepted and never used (they are rendered in `BookingMeta` instead) | Remove the prop | minor |
| b | `BE publicController.ts:2550-2560` | Returns every segment; the frontend groups them. Fine. | – | – |

### 3.10 baseDoctorLicense / doctor licence purchase
| # | file:line | Now | Fix | Sev |
|---|---|---|---|---|
| a | `BE doctorController.ts:4019` | `purchaseLicense` does not check `license.isActive`: an inactive tier can be bought by id | Filter on `isActive:true` | major |
| b | `doctorController.ts:4043-4053` | The wallet check (`balance < price`) and the debit (`$inc`) are separate. Two concurrent requests can both pass, which double-spends or drives the balance negative. The `Transaction` is written after the licence, not atomically. | A conditional `findOneAndUpdate({balance:{$gte:price}}, {$inc:-price})` plus a Mongo session | **blocker** (money) |
| c | `BaseDoctorLicense.ts` `isDefault` | Nothing enforces a single default; `findOne({isDefault:true})` (`doctorController.ts:4121`) picks one arbitrarily | A partial unique index, or unset the others on save | minor |
| d | `doctorController.ts:4125` | With no default tier, **every** module is allowed | **[PD]:** acceptable as a bootstrap, but document it in the admin | minor |

---

## 4. Summary of the fix order
1. **Blockers:** the national-ID leak (3.2a); the broken booking funnel to `/doctors` (3.2n); unifying the doctor card (§1, starting with DoctorCard vs DoctorCardAlt on the speciality page); the "apply request" path that crashes and loses the speciality (2.3a); the licence wallet race (3.10b).
2. **Model:** enforce the doctor ↔ speciality invariant (2.3d), IRIMC mapping (2.3b), rename category → group (navigation only), and the Doctor → DoctorProfile merge plus migration (§2.5).
3. **Majors:** in §3.
4. **Cleanup:** delete the dead cards G-K and `Bitches`, and remove the hardcoded 4.9 / 98% / 20 / 50 values.

Product decisions needed: search card variant (1.2B), retiring PhoneConsultSettings (3.2g), a single onboarding flow (3.4b), whether the admin may override clinic consent (3.5b), feedback moderation roles (3.6c), doctor-FAQ moderation (3.7a), auto-deactivating doctors without a speciality (§2.5 step 6), access levels for service/serviceCategory/servicePackage (3.8h), and the licence behaviour with no default tier (3.10d).
