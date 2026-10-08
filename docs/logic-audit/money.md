# NoyanAI logic audit: money, plans and commerce

Scope: super admin sections baseDoctor/Clinic/Hospital/ParaClinic/Pharmacy/InsuranceLicense, licenseDuration, globalFinanceSettings, globalTaxSettings, appConfig, sepTest, snappTest, product, productCategory, productPackage, service, servicePackage, plus the flows behind them: wallets and transactions, cart/checkout/order, reservation payments, payouts and refunds.

Method: I followed `.claude/agents/logic-auditor.md` (model, then its readers and writers, then the admin side, then the user side, then the leaders). The audit was read-only: no repo file was edited.
Backend = `/home/user/noyanaitest-back`, frontend = `/home/user/noyanaitest`.
Units: all internal amounts are **toman**. SEP gets `amount * sepAmountMultiplier` in rial. Admin and user labels say "تومان" consistently, and no rial/toman mix-up was found in labels.

Severity: **blocker** = money can be created or lost, or the ledger becomes wrong. **major** = a rule is broken or a configured setting has no effect. **minor** = cosmetic, confusing, or an edge case.
"PD" = needs a product decision before fixing.

---

## 0. Top findings (read this first)

| # | Severity | Finding |
|---|---|---|
| C-1 | blocker | Cart quantity can go negative. A buyer lowers the order total, then cancels the positive line and gets back more than they paid: wallet money is created from nothing. |
| F-1 | blocker/major | Commission (`globalFinanceSettings` and the per-org `*FinanceSettings`) is configured in admin but **never read**. Every payout is 100% of the pre-tax price. |
| L-1 | major | License purchase debits the wallet non-atomically (read, check, then `$inc`), in all 6 org controllers. Concurrent requests double-debit or overdraw, and there is no rollback if a later step throws. |
| L-2 | major | For clinic, hospital, insurance, paraClinic and pharmacy, **any mounted secretary** (even one with no ACL) can buy a license. It is paid from the *secretary's own* wallet. |
| P-1 | major | SEP `verifyNoResponse` marks the payment `failed`. If the verify reached SEP but the answer was lost, the shopper is charged and never credited. |
| R-1 | major | Phone-consult (`phone`) reservations can never be marked present, so every one ends as `error`: the patient is always refunded and the doctor is never paid. |
| R-2 | major | For in-person visits, the doctor's check-in is the only presence signal. If the doctor forgets it, the patient gets a full refund. If the doctor abuses it, the doctor alone decides the payout. |
| W-1 | blocker (PD) | Nothing lets money leave the platform: no provider withdrawal or settlement, and no refund to card. Provider earnings and buyer refunds are stuck as wallet balance. |
| A-1 | major | The admin cannot see or act on orders, transactions, gateway payments or reservation payments. The dashboard counts `needsReview` payments but links nowhere. |
| T-1 | major | A cancelled line's tax refund is a pro-rata share of the order's *total* tax, not the line's own tax. Mixed-rate orders refund the wrong amount. |
| O-1 | major | Sellers whose license has lapsed keep receiving paid orders they are blocked from fulfilling, and no sweep auto-cancels stale lines. |
| M-1 | major | License modules are enforced in the backend only for some modules. `secrataries`, `articles`, `financialMangement`, `offers`, `discounts`, `chatWithPatients` and `patientDocuments` are frontend-only gates. |

---

## 1. Cart / checkout / order (`Controllers/cartController.ts`, `Models/Cart.ts`, `Models/Order.ts`)

### C-1 Negative cart quantity creates wallet money — blocker
**Status (re-checked 2026-10-07): fixed** (quantity never below 1, bounded, bad legacy lines block checkout).
- **Where:** `Controllers/cartController.ts:125-131` (`mutateCartItem`); `Models/Cart.ts:42,55,68,81,94` (`qty` has no `min`).
- **Now:** For an existing line, `qty += amount` with any integer `amount`. The line is spliced only when `qty === -amount`, so qty 1 with amount -3 gives qty -2. `computeCartPricing` (`:241-252`) then adds `price * qty`, which is negative, to the subtotal. `Order.total` has `min: 0` (`Models/Order.ts`), so only the *order* total must be at least 0, not each line. Example: line A is 1 × 1,000,000 and line B is -1 × 900,000, so the buyer pays 100,000. The buyer cancels line A (`userController.cancelMyOrder` → `settleOrderLine` cancelled branch, `Services/orderSettlementService.ts:106-126`), which refunds `lineTotal (1,000,000) + taxShare`. Net gain: 900,000 in wallet balance. If a seller fulfils line A instead, the seller is paid 1,000,000 while the buyer paid 100,000.
- **Why wrong:** Data can be created in an invalid state, and money moves more than once. Every leader (Digikala, Halodoc) clamps quantity to at least 1.
- **Fix:** In `mutateCartItem`, compute `next = qty + amount`: if `next <= 0`, splice the line, otherwise set it. Add `min: 1` to every `qty` in `Cart` and `Order`. In `computeCartPricing`, reject `entry.qty < 1` or non-integer values. Optionally cap qty, for example at 100 for products and 1 for services.

### C-2 Catalog `Product.isActive` is not checked at checkout — major
**Status (2026-10-07): fixed.** The cart refuses offers on inactive catalog products/tests and suspended or inactive sellers; `ParaClinicTest` now has its own `isActive` (lab pause), checked by the public page and the cart.
- **Where:** `Controllers/cartController.ts:180-186, 236-240` (it checks only `ProductSeller.isActive`).
- **Now:** The public pharmacy page hides offers on an inactive catalog product (`publicController.ts:1950`), but the cart still sells them. An admin deactivating a recalled drug does not stop sales. The same gap exists for `Test.isActive` behind `ParaClinicTest`, and `ParaClinicTest` has no `isActive` of its own, so a paraclinic cannot pause a test.
- **Fix:** Populate `products.item.product` and `tests.item.test`, and refuse inactive catalog parents. Add `isActive` to `ParaClinicTest`. Also refuse items whose owning org is suspended or unverified.

### C-3 Several SEP checkouts of one cart can each create a paid order — minor
- **Where:** `cartController.ts:325-356`; `paymentService.ts:328-384`.
- **Now:** The cart stays intact while an order is `pending`. Submitting twice creates two pending orders and two payments. If both are paid, the same cart is bought twice. When a payment settles, `Cart.findOneAndReplace` also wipes items the buyer added in the meantime.
- **Fix:** Before creating a new pending SEP order for the user, cancel the user's other pending SEP orders, or reuse the existing one. After payment, clear only the lines that were ordered.

### C-4 Order-level status never reaches a terminal state — minor
- **Where:** `Models/Order.ts` (`orderStatuses = pending|paid|cancelled`).
- **Now:** When every line is fulfilled or cancelled, the order stays `paid` forever. Admin dashboard "sales" (`adminDashboardController.ts:136`) counts the full total even after lines are refunded.
- **Fix:** Derive `completed`/`cancelled` once no line is pending, and report net sales (paid minus refunds).

### C-5 Price and discount validation gaps — minor
**Status (pharmacy/lab part): fixed.** `ProductSeller` has `min: 0` and `discountWithinPrice`; lab offers need a price >= 1.
- **Where:** `pharmacyController.ts:651-652,682-683` (ProductSeller), `paraClinicController.ts:553,580` (ParaClinicTest): `z.coerce.number()` with no bounds. No path checks `discount <= price` (`doctorController.ts:2238-2239,2346-2347`; `pharmacyController.ts:1090-1091`).
- **Now:** A negative discount *raises* the sale price above the list price, because `price - discount`. A discount larger than the price makes the item free, because `Math.max(0, …)`. The admin auto routes for `service`, `servicePackage` and `productPackage` (`autoRouter.ts:659,966,977`) let an admin create an item with no `owner`. Such a cart line gets 0 tax and no seller can ever fulfil it.
- **Fix:** Bound price and discount to at least 0, require `discount <= price`, and require `owner` in these models.

### C-6 Package "savings" compare against the admin base price, not the seller's price — minor
**Status: fixed.** The "bought separately" price uses the owning pharmacy's own offers.
- **Where:** `Components/ProductPackage/ProductPackagePageTabs.tsx:59`, `DiffCalc` in `ProductPackagePage.tsx:83`.
- **Now:** The "separate price" and the savings use `Product.price`, the admin-entered "قیمت پایه" (`Components/Admin/Product/AdminManageProductPage.tsx:81`). They do not use what this pharmacy actually charges (`ProductSeller.price`), so the claimed savings can be invented. `Product.price` is otherwise read by no money flow.
- **Fix:** Compute the savings from the owning pharmacy's `ProductSeller` prices for the package's products.

---

## 2. Payouts, commission and settlement

### F-1 Commission is configured but never applied — blocker/major (PD for the formula)
- **Where:** `Models/GlobalFinanceSettings.ts`, the per-org models (`Pharmacy`/`Doctor`/`ParaClinicFinanceSettings`), the admin page `Components/Admin/FinanceSettings/AdminManageGlobalFinanceSettingsPage.tsx:46-54`, and the tabs `DoctorCommissionTab`, `PharmacyCommissionTab`, `ParaClinicCommissionTab`.
- **Now:** `grep CommissionPercent|FinanceSettings` in Controllers, Services and Lib finds no reader outside `autoRouter.ts`. Both payout paths ignore it:
  - `Services/orderSettlementService.ts:76,88` credits `price*qty` in full.
  - `Services/reservationProgressService.ts:73-84` credits `reservation.subtotal` in full (a `TODO: real payout formula` at `:73`).
- **Why wrong:** The admin action does not do what its label says. The leaders (Doctolib and Zocdoc per booking, Halodoc and Digikala per order line) deduct the platform fee at settlement and show gross, fee and net to the provider.
- **Fix:** Add a `Lib/financeSettings.ts` mirroring `Lib/taxSettings.ts` (org doc, then global fallback). At payout, compute `fee = round(base * pct / 100)` and `net = base - fee`, and credit `net`. Record `gross/fee/net` on the payout Transaction (new fields) or write a second platform-revenue Transaction. Snapshot the rate on the Order line or Reservation at purchase time, so a later rate change does not reprice sold items. **PD:** is commission taken on the pre-tax base, and does it also apply to no-show payouts?

### F-2 Payout credit and its Transaction are not atomic — minor
- **Where:** `orderSettlementService.ts:45-55, 88-95, 120-126`; `reservationProgressService.ts:79-90, 132-142`; `reservationCancelService.ts:65-77`.
- **Now:** The code calls `Wallet.$inc` and then `Transaction.create`. A crash between the two leaves a credit with no ledger row, and the idempotency check (`Transaction.exists`) then lets a retry credit again. `Transaction` has no unique index on `(order, orderItem, user)` or `(reservation, user, sign)`.
- **Fix:** Create the Transaction first behind a unique partial index, then `$inc`. Alternatively use a Mongo session or transaction, as a replica set supports.

### F-3 Provider earnings go to the personal user wallet, and nothing lets money leave — blocker (PD)
- **Where:** `Models/Wallet.ts` (one wallet per User); `Models/UserAlert.ts:30-34` ("no withdrawal feature/model exists"); `Controllers/financeController.ts` (balance only).
- **Now:** Doctor, pharmacy and paraclinic payouts are credited to the owner's User wallet. There is no withdrawal or settlement (Sheba/IBAN) request, and no admin payout batch. Every refund (order line, reservation, no-show) also goes to the wallet only, with no card refund.
- **Why wrong:** Money never leaves the platform. The leaders pay providers out weekly or monthly (Doctolib, Paziresh24, SnappDoctor). Shaparak rules expect a refund to the original card when the customer asks for one.
- **Fix (PD):** Add a `WithdrawalRequest` model (amount, Sheba, status pending/paid/rejected, atomic hold on the balance), an admin queue page, and the existing `newWithdrawalRequest` alert. Decide whether provider earnings get their own org wallet, kept separate from the owner's personal buyer wallet.

### F-4 Payouts are credited immediately, with no hold or dispute window — minor (PD)
- **Where:** `orderSettlementService.ts:80-95` (credited at the moment the seller marks the line `fulfilled`).
- **Now:** The seller's self-declared "fulfilled" pays out instantly. The buyer has no delivery confirmation and no dispute window.
- **Fix (PD):** Hold earnings as `pending` until delivery is confirmed, or for N days, the way Digikala and Halodoc do.

---

## 3. Tax (`Lib/taxSettings.ts`, `Models/GlobalTaxSettings.ts`, per-org `*TaxSettings`)

Applied consistently: reservations use `bookingController.ts:159-161`, and the rate is shown to the buyer at `FinalizeBookingPage.tsx:469-476`. Cart lines use `cartController.ts:207-218,254-262`, and the buyer sees it in `getCartSummary` and `CartCheckoutPopup`. Payouts exclude tax. Remaining problems:

### T-1 A line's tax refund is a pro-rata share of the whole order's tax — major
- **Where:** `Services/orderSettlementService.ts:108-112`; `Models/Order.ts` stores no tax per line.
- **Now:** `taxShare = order.tax * lineTotal / order.subtotal`. With a pharmacy line at 10% and a doctor service at 0%, cancelling the 0% line refunds part of the pharmacy's tax, and the buyer gets more back than was charged on that line. Rounding each share on its own can also refund 1 toman more than `order.tax` in total.
- **Fix:** Snapshot `taxPercent` and `tax` on each order line in `computeCartPricing`, refund exactly that line's tax, and cap the cumulative refunds at `order.tax`.

### T-2 Collected tax has no owner and no report — major (PD)
- **Now:** The buyer pays the tax and the seller is paid pre-tax, so the tax stays on the platform. No Transaction, report or admin view records how much tax was collected per org or period for remittance.
- **Why wrong / PD:** Under Iranian VAT the seller is normally the taxpayer. Medical services and most medicines are exempt. Either the platform acts as the collecting agent (and needs a report) or the tax should be passed to the seller.
- **Fix:** Decide who remits the tax. Then either add the tax to the seller payout, or add an admin "tax collected" report built from the per-line snapshots in T-1.

### T-3 Clinic tax is a layer with no meaning — minor
- **Where:** `defaultClinicTaxPercent` in `Models/GlobalTaxSettings.ts`; `ClinicTaxSettings`, and `Components/Admin/Clinic/ClinicTaxTab.tsx`; `Lib/taxSettings.ts:57-68`, whose own comment says "Not consumed by any checkout".
- **Fix:** Hide the clinic tax field and tab until a clinic sells something, or label it "unused for now".

### T-4 Licenses are sold with no tax — minor (PD)
- **Where:** all `purchaseLicense` handlers (see L-1).
- **Now:** SaaS subscriptions normally carry 10% VAT in Iran, but `GlobalTaxSettings` has no license rate.
- **Fix (PD):** Add `defaultLicenseTaxPercent` and show it on `LicenseCheckoutPage`.

---

## 4. Licenses: purchase, modules, durations

### L-1 Non-atomic wallet debit in every purchaseLicense — major
- **Where:** `doctorController.ts:4049-4058`, `clinicController.ts:567-576`, `paraClinicController.ts:766-775`, `pharmacyController.ts:1317-1326`, `hospitalController.ts:334-343`, `InsuracneController.ts:296-305`.
- **Now:** The code reads the wallet, checks `balance < price`, then runs `findByIdAndUpdate($inc: -price)` with no `balance >= price` filter. `$inc` skips `min: 0` validation, so two concurrent purchases both pass the check and the balance goes negative. The active-license check (`:4027-4031`) is also a read-then-write, so two parallel requests both "buy" and both are charged, with the second overwriting the first. The debit runs before `ProfileLicense.findOneAndUpdate` and `Transaction.create`, with no rollback, so if either throws the money is gone with no license and no ledger row.
- **Fix:** Copy the cart pattern (`cartController.ts:399-431`): an atomic `findOneAndUpdate({_id, balance: {$gte: price}}, {$inc: -price})`, then write the license and Transaction, and refund on error. For the double-buy race, make the ProfileLicense upsert conditional on `expiresAt <= now` or unset, and refund when it matches nothing. Extract one shared `purchaseOrgLicense()` helper instead of six copies.

### L-2 A secretary can buy the org's license from their own wallet — major
- **Where:** `clinicRouter.ts:153`, `hospitalRouter.ts:102`, `insuranceRouter.ts:99`, `paraClinicRouter.ts:245`, `pharmacyRouter.ts:324`, which use `useX()` with no action. `aclController.ts:205-214`: with no action, any mounted secretary passes, even one with a null ACL. The doctor route correctly uses `useDoctor(true)` (`doctorRouter.ts:1059`).
- **Now:** `Wallet` and `Transaction` are keyed by `req.user`, which is the secretary, so the secretary pays for the owner's plan.
- **Fix:** Use `useX(true)` (owner only) on the five POST routes, the same as doctor.

### L-3 An inactive plan can be bought by its id — minor
- **Where:** `doctorController.ts:4019` and the same line in all 6 controllers: `findById(nodeId)` with no `isActive` check.
- **Fix:** Use `findOne({_id: nodeId, isActive: true})`.

### M-1 License modules are enforced in the backend only for some modules — major
- **Where:** the `requireLicenseModule` usage in `Routers/*Router.ts`.
- **Now:** Enforced: doctor `profile, clinics, hospitals, shifts, schedule, settings, insurances, phrmaciesAndLabs, patients, drugsAndPrescriptions, office, services, servicePackages, incomingOrders`; clinic `profile, prescriptions`; hospital/insurance `profile`; paraClinic `tests, incomingOrders, tamin`; pharmacy `products, productPackages, incomingOrders, tamin`.
  **Never enforced server-side:** `secrataries` (`aclRouter.ts:32-54`), `articles` (`blogRouter.ts:19-36`), doctor `financialMangement` (`doctorRouter.ts:1031`), `offers`, `discounts`, `chatWithPatients`, `patientDocuments`, `dashboard`. For these, only the frontend `*LicenseGate` hides the page, so the API works without a plan.
- **Fix:** Add `requireLicenseModule` to those routes. For `aclRouter` and `blogRouter`, which are org-generic, resolve the org from `req.params.name`. Any module left ungated on purpose should be removed from the plan's module picker, so the admin cannot "sell" something that is free.

### L-4 No renewal, upgrade or expiry reminder — major (PD)
- **Where:** `doctorController.ts:4022-4031` (`ActiveLicenseExistsError` until expiry). No sweep reads `expiresAt` (grep in Services and server).
- **Now:** A provider cannot renew early or upgrade. The plan has to lapse, which drops modules back to the default tier, before they can buy again, and nothing warns them before it expires.
- **Why wrong:** Doctolib Pro and Docplanner Pro renew automatically, warn before expiry, and prorate upgrades.
- **Fix (PD):** For the same plan, allow a renewal that sets `expiresAt = max(now, current.expiresAt) + duration`. For a higher tier, allow an upgrade with proration or a start at the end of the current period. Add a reminder sweep (7 days and 1 day before, via UserAlert/SMS).

### L-5 Purchased modules are a snapshot — minor (PD)
- **Where:** `doctorController.ts:4071-4079`, which copies `license.modules` into the ProfileLicense.
- **Now:** When the admin edits a plan's modules, existing holders keep the old list until they buy again. That is grandfathering, but nothing in the admin UI says so.
- **Fix:** Either resolve modules live from `baseLicense`, or show "changes apply to new purchases only" on the plan form.

### L-6 Default-tier semantics are fragile — minor
- **Where:** `doctorController.ts:4114-4124` (the same resolver in each org).
- **Now:** If no tier has `isDefault`, **every** module is allowed, so buying a plan unlocks nothing. If several tiers have `isDefault`, the one used is arbitrary (`findOne`). A default tier with a price above 0 can be bought for modules the buyer already has for free. A default tier with `modules: []` locks every unlicensed provider out of all gated routes.
- **Fix:** Enforce at most one `isDefault` (a unique partial index, or unset the others on save). Warn in admin when there is none. Hide or disable "buy" on the default tier.

### D-1 LicenseDuration validation and i18n — minor
- **Where:** `Models/LicenseDuration.ts:14-18`; `Lib/i18n/translatableFields.ts:27,181-186`.
- **Now:** `duration` (days, labelled "مدت (روز)") has no `min`, so 0 or a negative value sells a license that has already expired. Deleting a duration (`autoRouter.ts:1543-1553`, `remove: true`) leaves dangling `pricing.duration` refs. `LicenseDuration.displayName` is not translatable, and plan `displayName`, `summary` and `descriptions` are not translatable either (only `details` is). Users in all 15 languages see the admin's Persian text (`LicenseDurationSelector.tsx:34`, `LicensePriceDetails.tsx:43`, `LicenseCard.tsx:66`). When `displayName` is empty the user UI shows a blank duration, while the admin UI falls back to "N روز".
- **Fix:** Add `min: 1` and an integer check. Block deleting a duration that a plan still references, or pull it from the plans. Add the `translatable` plugin plus the fields to translatableFields. On the user side, fall back to a localized "N days".

### D-2 License pricing editor has no rules — minor
- **Where:** `Components/Admin/UI/LicensePricingInput.tsx:118-140`; `Models/BaseLicensePricing.ts:23-24`.
- **Now:** `discount` is an absolute amount, but its label is just "تخفیف" (amount or percent is unclear). Negative values and `discount > price` are accepted. `isDiscounted` is a manual flag that shows a "discount" badge (`LicenseCard.tsx:50`) whether or not any discount exists, which is a fake label.
- **Fix:** Label it "تخفیف (تومان)", validate `0 <= discount <= price`, and derive `isDiscounted` from `pricing.some(p => p.isActive && p.discount > 0)`.

---

## 5. SEP online payment (`Services/paymentService.ts`, `Controllers/paymentController.ts`, admin `sepTest`)

The design is sound overall: a unique `refNum`, the atomic created→verifying claim, an amount and terminal check with a reverse on mismatch, an idempotent wallet credit guarded by `Transaction.gatewayPayment`, and a recovery sweep. Gaps:

### P-1 A lost verify response is treated as a failure — major
- **Where:** `paymentService.ts:246-252`.
- **Now:** When `verifySepTransaction` returns null after retries, the payment moves to `failed`, on the assumption that "SEP reverses unverified payments". If the verify request *reached* SEP and only the response was lost, the transaction is already verified and will not be auto-reversed. The shopper is charged, never credited, and the sweep ignores `failed`.
- **Fix:** Leave the payment in `verifying`, bump `claimedAt`, and let `runGatewayPaymentSweep` retry: SEP's ResultCode 2 confirms it and the sweep settles it. After N attempts, move it to `needsReview`, never to `failed`.

### P-2 `needsReview` payments cannot be acted on — major
- **Where:** `adminDashboardController.ts:57` (no `href`); no admin route or page for GatewayPayment (`autoRouter.ts` has no entry, and `adminSepTest` lists only the admin's own 20 payments, `paymentController.ts:133-138`).
- **Fix:** Add an admin GatewayPayment list and detail page with filters by status, user and date, plus actions "re-verify", "credit manually (with an audit log)" and "mark reversed". Point the dashboard tile to it.

### P-3 `sepAmountMultiplier` is admin-editable — minor
- **Where:** `AdminManageAppConfigPage.tsx:163`; `paymentService.ts:65`.
- **Now:** Toman to rial is a fixed ×10. If an admin sets 1 or 100 by mistake, every payment is charged 10 times too little or too much. The amount check passes because it compares against our own `gatewayAmount`.
- **Fix:** Hard-code 10, or make the field read-only and show the conversion.

### P-4 Other minor gaps — minor
- `chargeWallet` has no maximum amount, though SEP and Shaparak enforce per-transaction limits. It also builds a Persian error with `toLocaleString("fa-IR")` inside the message (`paymentController.ts:50-55`), which the `errorMessages.ts` translation lookup cannot match.
- There is no rate limit on creating gateway payments.

---

## 6. Reservation payments (`bookingController.ts`, `reservationProgressService.ts`, `reservationCancelService.ts`, `reservationActivationService.ts`)

The debit is atomic (`bookingController.ts:189-196`), the cancel is guarded by the status flip, and refunds and payouts are idempotent per reservation. Gaps:

### R-1 `phone` reservations always refund and never pay the doctor — major
- **Where:** `reservationActivationService.ts:173-176` (`phone: activateInPerson`, reminder only); `doctorController.ts:952` (check-in only for `sessionType: "inPerson"`); finalization at `reservationActivationService.ts:364-370`.
- **Now:** Nothing ever sets presence for `phone`, so the result is always `error`, a full refund, and nothing for the doctor. Yet `phone` is bookable and paid (`bookingController.ts:84,148-155`).
- **Fix:** Either turn off `phone` booking until it has a real channel (the sipCall dispatch), or allow check-in for `phone` too. PD: which one.

### R-2 In-person outcome depends only on the doctor's check-in — major (PD)
- **Where:** `doctorController.ts:935-972`; finalization at `reservationActivationService.ts:352-370`.
- **Now:** If the doctor forgets to check in, "neither present" leads to `error` and a **full refund** to a patient who did attend. If the doctor checks in (from 60 minutes before the start), the patient is also marked present and the doctor is paid, with no patient confirmation.
- **Why wrong:** Doctolib and Paziresh24 either do not prepay in-person visits, or settle them unless the patient disputes. Refunding by default when data is missing hurts doctors, and doctor-only attestation lets a doctor pay themselves.
- **Fix (PD):** For in-person visits with no signal, default to "completed / pay the doctor" after a dispute window, and let the patient report "doctor absent". Or add a patient-side check-in (a QR code or OTP at the office).

### R-3 Double-booking race on a slot — minor
- **Where:** `bookingController.ts:139-147,172-185`; `Models/Reservation.ts:245,251` (the indexes are not unique).
- **Now:** Two concurrent bookings both pass `Reservation.exists`, and both are created and charged.
- **Fix:** A unique partial index on `{doctor, date, start}` where `status != cancelled`, or a slot-lock document.

### R-4 Hardcoded Persian and a mixed-up server clock — minor
- **Now:** Notifications from `reservationProgressService.ts:104-106,156-157,164-165,177-178` and `reservationCancelService.ts:96-105` are Persian strings stored in the DB, so every locale sees Persian. `bookingController.ts:121-125` compares `new Date().getHours()` (server TZ) with slot minutes, while the dashboard uses Tehran TZ (`adminDashboardController.ts`). If the server is on UTC, same-day slots are accepted or refused 3.5 hours off.
- **Fix:** Store content keys and variables for notifications. Use `TIMEZONE` for the hour check.

### R-5 Reservations can be paid only from the wallet — minor (PD)
- **Where:** `bookingController.ts:62` (`method: z.enum(["wallet"])`).
- **Now:** The cart supports SEP but booking does not, so the patient has to top up first and then book (two steps). Paziresh24 and Doctolib pay in one step.
- **Fix:** Add a `sep` method with a pending reservation that holds the slot for the token lifetime, reusing `startSepPayment`.

---

## 7. Orders: seller side

### O-1 Sellers with a lapsed license keep receiving orders they cannot process, and nothing auto-cancels — major
**Status: half fixed.** Checkout refuses items whose seller lacks `incomingOrders`, and (2026-10-07) the public pharmacy / lab / product pages no longer offer them for sale. **Open [PD]:** a sweep that cancels and refunds lines left pending past an SLA (N hours for pharmacy, longer for labs, where the sample is taken later).
- **Where:** `pharmacyRouter.ts:207-209`, `doctorRouter.ts:623-625`, `paraClinicRouter.ts:144-146` (`requireLicenseModule("incomingOrders")` on the fulfil and cancel routes); the cart does not check the seller's license or status (`cartController.ts:224-265`).
- **Now:** When a seller's plan expires or lacks `incomingOrders`, buyers can still pay for that seller's items, but the seller gets `AccessError` when they try to fulfil or cancel. The buyer's money waits until the buyer notices and cancels. No sweep cancels lines left `pending` too long.
- **Why wrong:** Halodoc and Digikala auto-cancel and refund when a seller does not confirm within an SLA.
- **Fix:** At checkout, refuse items whose seller lacks the `incomingOrders` module (or hide those listings publicly). Add a sweep that cancels and refunds lines pending for more than N hours, reusing `settleOrderLine`.

---

## 8. Admin views of money

### A-1 No admin view or action for orders, transactions, reservation payments or wallets — major
- **Where:** `Routers/autoRouter.ts` has no `order`, `transaction`, `wallet`, `gatewayPayment` or `reservation` entry. `adminRouter.ts` has no money routes. `adminUserController.ts:137,166` shows only the wallet balance. The `app/[adminKey]/` folder has no such section.
- **Now:** Support cannot look up an order, refund a line, see why a payout happened, fix a wallet, or answer "I paid but…".
- **Fix:** Add read-only admin lists (orders with lines and statuses; transactions filterable by user, org and kind; reservations with money status), plus audited actions: refund a line or reservation (through `settleOrderLine` / `refundPatient`) and adjust a wallet with a reason (`adminAudit`).

### A-2 Dashboard money tiles are mislabelled — minor
- **Where:** `AdminDashboardPage.tsx:200-211`; `adminDashboardController.ts:136-146,160-162`.
- **Now:** "درآمد نوبت‌ها" (reservation revenue) is the GMV of completed reservations *including tax*. It excludes paid patient no-shows, and the platform's real revenue from it is only the tax (commission is 0, see F-1). "فروش سفارش‌ها" (order sales) ignores line refunds.
- **Fix:** Rename the tiles to "gross" and add net and platform revenue once F-1 exists.

### A-3 Transactions have no kind, so the UI guesses and mislabels them — minor
- **Where:** `Models/Transaction.ts` (no `kind` field); `Components/Dashboard/Transaction/DashboardManageTransactionsPage.tsx:37-39,131,136`.
- **Now:** For a doctor or pharmacy owner, whose User wallet also receives payouts, a positive reservation or order transaction is labelled "refund" (`trVisitRefund`, `trOrderRefund`) when it is really a payout. License purchases fall into "other". `getMyTransactions` (`userController.ts:800-812`) is unpaginated.
- **Fix:** Add `kind: "topUp"|"orderPay"|"orderRefund"|"orderPayout"|"visitPay"|"visitRefund"|"visitPayout"|"licensePurchase"|"commission"|"adjustment"`, backfill it from the existing refs, label rows by `kind`, and paginate the list.

---

## 9. Dead or legacy money code

- **Minor:** `Models/Checkout.ts` and `Models/Offer.ts` are imported nowhere, and `Transaction.checkout` is a dead ref. `Invoice` and `InvocieCheckout` (legacy System A) are still listed at `/dashboard/invoice`, where "unpaid" invoices have no way to be paid (`userController.ts:484-552`, `DashboardManageInvoicesPage.tsx`). `Components/Booking/SelectSessionToReservePopup.tsx:178-187` still posts to `/booking/book` and routes to the invoice page. The popup is no longer rendered, but its `paymentMethods` export is still used by `FinalizeBookingPage`.
  **Fix:** Hide unpaid legacy invoices, or mark them "archived", and delete the dead popup body and models once the data is migrated.

---

## 10. Leader benchmark (summary)

- **Settlement:** Doctolib, Zocdoc and Digikala take the commission at settlement, hold funds for a period, and pay out to a bank account on a schedule. NoyanAI credits 100% instantly to a wallet that cannot be withdrawn from (F-1, F-3, F-4).
- **Subscriptions:** Doctolib Pro and Docplanner Pro auto-renew, send pre-expiry reminders, and prorate upgrades. NoyanAI blocks renewal until the plan lapses (L-4).
- **Orders:** Halodoc and Digikala auto-cancel unconfirmed lines after an SLA, refund to the original card when asked, and give support a full order console. NoyanAI has none of these (O-1, W-1, A-1).
- **Where NoyanAI does better:** tax is shown before paying on both flows; per-line cancel and refund is idempotent; the SEP double-spend protection (unique RefNum, atomic claim, amount check with reverse) is stronger than many Iranian competitors.

## 11. Needs a product decision

F-1 (commission formula and base), F-3/W-1 (withdrawal model, card refunds, separate org wallet), F-4 (payout hold), T-2 (who remits the tax), T-4 (tax on licenses), L-4 (renew and upgrade policy), L-5 (grandfathering), R-1 (phone: disable or add check-in), R-2 (in-person default outcome), R-5 (SEP for booking).

Everything else can be fixed without a product decision. No fixes were applied: this audit was read-only.
