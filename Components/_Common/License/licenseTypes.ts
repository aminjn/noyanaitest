import { MongoDoc } from "@/Components/Hooks/useUser";
import { doctorDashboardModuleLabels } from "@/Components/Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";
import { pharmacyDashboardModuleLabels } from "@/Components/Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";
import { clinicDashboardModuleLabels } from "@/Components/Admin/BaseClinicLicense/AdminManageBaseClinicLicensesPage";
import { paraClinicDashboardModuleLabels } from "@/Components/Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";
import { hospitalDashboardModuleLabels } from "@/Components/Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";
import { insuranceDashboardModuleLabels } from "@/Components/Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";

// The org types that have a license catalog + purchase flow (2026-09).
// Mirrors the subset of Components/_Common/SecretaryManager's NodeWithAcl
// (see Request/CreateSecretaryRequestPopup.tsx) that actually has
// Base<Org>License / <Org>ProfileLicense models and license routes on
// noyanai-back. Also matches the exact API path segment each org is
// mounted under (app.ts's `nameToRouter`), so `${API}/${name}/license` etc.
// below is valid for every value here.
export const licenseOrgs = [
  "doctor",
  "pharmacy",
  "clinic",
  "paraClinic",
  "hospital",
  "insurance",
] as const;

export type LicenseOrg = (typeof licenseOrgs)[number];

// Maps a LicenseOrg to its panel root on noyanai-front, same mapping as
// Components/_Common/SecretaryManager/SecretaryManager.tsx's own
// panelRootByNode.
export const licensePanelRootByOrg: Record<LicenseOrg, string> = {
  doctor: "/doctorpanel",
  pharmacy: "/pharmacypanel",
  clinic: "/clinicpanel",
  paraClinic: "/paraClinicPanel",
  hospital: "/hospitalpanel",
  insurance: "/insurancepanel",
};

// Per-org dashboard-module label map, keyed the same way as licenseOrgs -
// reuses each org's own Admin/Base<Org>License Persian label Record
// instead of redeclaring the labels here. Used by the shared license pages
// (e.g. AllLicensePlansPage) to render a module's display name without
// every call site having to import the right org-specific map itself.
export const licenseModuleLabelsByOrg: Record<
  LicenseOrg,
  Record<string, string>
> = {
  doctor: doctorDashboardModuleLabels,
  pharmacy: pharmacyDashboardModuleLabels,
  clinic: clinicDashboardModuleLabels,
  paraClinic: paraClinicDashboardModuleLabels,
  hospital: hospitalDashboardModuleLabels,
  insurance: insuranceDashboardModuleLabels,
};

// Mirrors backend Models/LicenseDuration.ts.
export interface ILicenseDuration extends MongoDoc {
  duration: number;
  displayName?: string;
  order: number;
}

// Mirrors backend Models/BaseLicensePricing.ts. `duration` is a raw id
// string on the list endpoints (getMyLicenseOverview/getActiveLicenses,
// which return every referenced ILicenseDuration separately instead of
// populating it onto each pricing entry - see ILicenseCatalog below) and
// the populated ILicenseDuration itself on the single-plan endpoint
// (getLicenseById).
export interface IBaseLicensePricing<TDuration = string> {
  duration: TDuration;
  isActive: boolean;
  price: number;
  discount: number;
}

// Mirrors backend Models/Base<Org>License.ts (BaseDoctorLicense/
// BasePharmacyLicense/BaseClinicLicense/BaseParaClinicLicense - identical
// shape across all four besides the `modules` enum). `modules` is left as
// string[] here since each org has its own DashboardModule union declared
// alongside its Admin/Base<Org>License page - callers that need the
// narrower type can re-type at the call site once they render it.
export interface IBaseLicense<TDuration = string> extends MongoDoc {
  displayName?: string;
  order: number;
  isDefault: boolean;
  isRecommended: boolean;
  isDiscounted: boolean;
  // Whether this plan is currently sellable at all. getMyLicenseOverview
  // and getActiveLicenses both only ever return isActive: true plans;
  // getLicenseById returns a plan regardless of this flag.
  isActive: boolean;
  // Whether this plan is part of the "primary" lineup shown on the main
  // license page (getMyLicenseOverview filters on isActive AND isPrimary).
  isPrimary: boolean;
  // Rich-text plan writeup (RTFEditor content on the admin form). Omitted
  // from getMyLicenseOverview/getActiveLicenses's list entries - only
  // getLicenseById's single-plan fetch includes it.
  isGolden: boolean;
  details?: string;
  pricing: IBaseLicensePricing<TDuration>[];
  descriptions: string[];
  modules: string[];
  summary?: string;
}

// Response shape shared by getMyLicenseOverview (GET <org>/license) and
// getActiveLicenses (GET <org>/license/all) - `durations` is every
// LicenseDuration referenced by at least one pricing entry across
// `licenses`, so the frontend can build a duration filter without a
// second round trip or per-entry duplication.
export interface ILicenseCatalog {
  licenses: IBaseLicense[];
  durations: ILicenseDuration[];
}

// Response shape of getActiveLicenses (GET <org>/license/all) specifically -
// same as ILicenseCatalog, plus every dashboard module key that exists for
// this org (e.g. the full doctorDashboardModules enum for "doctor"), not
// just the ones referenced by a returned license's own `modules[]`. Lets
// the "see all plans" page render a full plan-vs-module comparison instead
// of only whatever the first plan happens to grant.
export interface IActiveLicenseCatalog extends ILicenseCatalog {
  modules: string[];
}

// Response shape of getLicenseById (GET <org>/license/:nodeId) - the full
// plan document, `details` included, each pricing entry's `duration`
// populated inline since there's only one document to enrich.
export type IBaseLicenseDetail = IBaseLicense<ILicenseDuration>;

// Mirrors backend Models/<Org>ProfileLicense.ts - the org's own currently
// assigned license record (one per org, upserted by purchaseLicense). Not
// to be confused with IBaseLicense above, which is a catalog entry an org
// can buy - this is what they actually own right now.
export interface IProfileLicense extends MongoDoc {
  displayName?: string;
  modules: string[];
  baseLicense?: string;
  startedAt?: string;
  expiresAt?: string;
}

// Response shape of getMyCurrentLicense (GET <org>/license/current) - used
// by CurrentLicenseWidget on each org's dashboard home. `current` is null
// if the org has never purchased a license; `isExpired` is true when
// `current.expiresAt` exists and is in the past, in which case
// resolveMyLicenseModules has already fallen back to the isDefault tier's
// modules on the backend, so the widget should treat this the same as "no
// license" rather than showing the expired plan as active.
export interface ICurrentLicense {
  current: IProfileLicense | null;
  isExpired: boolean;
}
