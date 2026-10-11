# Bulk provider import (JSON), format version 1

Super admin → «پزشکان» → tab «ورود گروهی (JSON)» (`/notadmin/doctorprofile?tab=import`).
Backend: `Services/providerImport.ts`, `Lib/providerImport/*`, routes under `/api/v1/admin/import`.

- Sample: `provider-import.sample.json` (also `/samples/noyan-providers-sample.json` on the site)
- JSON Schema: `provider-import.schema.json` (also `/samples/noyan-providers.schema.json`); regenerate with
  `node compile/Scripts/providerImportSchema.js <out>` in the backend after a catalogue change.

Any JSON shape is accepted: the panel finds the record lists, the admin says which list is what and maps the
fields (field / several fields joined / constant, split, transforms, value maps, child lists). The native
format below maps 1:1.

## Top level

```json
{ "version": 1, "doctors": [], "offices": [], "clinics": [], "hospitals": [], "pharmacies": [], "paraclinics": [], "insurances": [] }
```

Records are written insurers → clinics → hospitals → labs → pharmacies → doctors → offices, so references resolve
within one file.

## Common rules

- `externalId` (required on top-level records): the source's id. Re-imports find the record by it, then by the
  medical council number (doctors), then by `slug`. No duplicates; a second run reports «بدون تغییر».
- Text fields can be a string (Persian, stored as is) or `{ "fa": "...", "en": "...", ... }` for translations;
  the rest is filled by the machine translation of the Translations page.
- Location: `lat` + `lng`, or `point: "lat,lng"`; a swapped pair inside Iran is fixed. The pin fills
  province / city / district (`Lib/geoFromPoint.ts`); without a pin `province` / `city` names are matched.
- Phones: `phone` is public (shown), `privatePhones` are kept for staff only (`ProviderImportLink`).
- Digits may be Persian / Arabic. Prices are in **tomans**.
- Images (`photo` / `logo`): http(s) URL, downloaded into our files; a failed download only warns.
- Imported pages are public and **unclaimed** (no account, no SMS). The doctor claims through the onboarding
  (council number + SMS OTP); a centre through its become-request approval. A claimed record is only
  filled where empty.

## Doctor

`externalId`, `firstName`*, `lastName`* (or `fullName`), `medicalCode`, `medicalTitle` (پزشکی، دندانپزشکی…),
`gender` (male/female, also مرد/زن/M/F), `mainSpeciality`, `specialities[]` (by name; unknown names are created),
`bio`, `education[]`, `photo`, `website`, `phone`, `privatePhones[]`, `insurances[]` (by name or the file's insurer),
`services[]` (service catalogue titles), `memberships[]` (clinic / hospital `externalId`s), `slug`, `active`,
`address`/`lat`/`lng`/`province`/`city` (becomes the office when there is no `offices` list),
`visitTypes[]`: `{ type: inPerson|videoCall|textChat|voiceCall (حضوری/تصویری/متنی/تلفنی), price*, duration, active }`,
`offices[]`: `{ externalId, name, address, addressDetail, lat, lng | point, province, city, phone, centre, active,
hours[] }`.

Top-level `offices[]` take the same fields plus `doctor` (the doctor's `externalId`).

## Hours row (offices and centres)

`{ day*, from, to }` or `{ day*, range: "09:00-13:00, 16:00-20:00" }`, optional `slotMinutes`, `visitTypes[]`.
`day`: `saturday`…`friday`, شنبه…جمعه, `0`–`6` (0 = Saturday), or a list of them. Office rows become the doctor's
weekly shifts (availability rebuilt); centre rows become the structured opening hours.

## Centres

- Clinic / hospital: `externalId`, `name`*, `slug`, `summary`, `category` (created if new), place fields, `phone`,
  `privatePhones`, `website`, `email`, `logo`, `roundTheClock`, `insurances[]`, `services[]`, `licenseNumber`
  (filled only when empty; never the verified tick), `personnelCount`, hospital `beds`, `hours[]`, `active`.
- Pharmacy: as above without category / services / website.
- Lab (`paraclinics`): plus `onlineResults`, `tests[]`: `{ name*, price*, readyTime, sampling: lab|labOrHome|none }`
  (unknown tests are created in the catalogue).
- Insurer (`insurances`): `name`*, `basic`, `summary`, `phone`, `website`, `address`, `lat`/`lng`, `logo`,
  `licenseNumber`, `coverages[]`, `advantages[]`, `category`.
