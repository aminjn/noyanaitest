import { ContentKey } from "../Enums/contentKeys";
import { ContentNamespace } from "../Enums/contentNamespaces";

// Single source of truth for the /become/[org] routes (2026-09 redo of the
// old single tab-based /become page). Every org that a visitor can request
// to become is registered here once: its route, the panel it belongs to
// once approved, the noyanai-back paths its request/profile live at, and
// the content keys/namespace its own page needs. Components consume this
// instead of hardcoding any of the above a second time.
//
// "doctor" is flagged `kind: "medicalCode"` because its become-flow isn't a
// name-only request form like the other 5 - it is the one doctor onboarding
// flow (2026-10, Components/DoctorPanel/BecomeADoctorPage.tsx, backend
// Controllers/doctorOnboardingController.ts): council inquiry, documents and
// speciality, then one request in the admin /requests queue.
export type BecomeOrgSlug =
  | "doctor"
  | "clinic"
  | "hospital"
  | "insurance"
  | "pharmacy"
  | "paraClinic";

export interface BecomeOrgConfig {
  slug: BecomeOrgSlug;
  // /become/[slug]
  path: string;
  // Where an approved node of this kind lives once it has a profile.
  panelPath: string;
  // GET returns the user's own node (or null); POST submits the become
  // request (Controllers/{org}Controller.ts becomeA{Org}).
  apiBase: string;
  // GET returns the user's own pending/approved/rejected become request (or
  // null). Controllers/{org}Controller.ts getMyBecome{Org}Request.
  requestApiPath: string;
  // The org's own display-name content key, e.g. getContent("clinic").
  nameKey: ContentKey;
  kind: "nameOnly" | "medicalCode";
  // Only set for kind: "nameOnly" pages - their own title/legend/namespace.
  titleKey?: ContentKey;
  legendKey?: ContentKey;
  namespace?: ContentNamespace;
  // (2026-10) an insurer gives its «شماره‌ی مجوز بیمه مرکزی» instead of
  // the centres' siam code and national id
  licenseNumber?: boolean;
}

export const becomeOrgs: Record<BecomeOrgSlug, BecomeOrgConfig> = {
  doctor: {
    slug: "doctor",
    path: "/become/doctor",
    panelPath: "/doctorpanel",
    apiBase: "/doctor",
    requestApiPath: "/doctor/request",
    nameKey: "doctor",
    kind: "medicalCode",
  },
  hospital: {
    slug: "hospital",
    path: "/become/hospital",
    panelPath: "/hospitalpanel",
    apiBase: "/hospital",
    requestApiPath: "/hospital/request",
    nameKey: "hospital",
    kind: "nameOnly",
    titleKey: "becomeHospitalPageTitle",
    legendKey: "becomeHospitalPageLegend",
    namespace: "becomeHospital",
  },
  clinic: {
    slug: "clinic",
    path: "/become/clinic",
    panelPath: "/clinicpanel",
    apiBase: "/clinic",
    requestApiPath: "/clinic/request",
    nameKey: "clinic",
    kind: "nameOnly",
    titleKey: "becomeClinicPageTitle",
    legendKey: "becomeClinicPageLegend",
    namespace: "becomeClinic",
  },
  paraClinic: {
    slug: "paraClinic",
    path: "/become/paraClinic",
    panelPath: "/paraClinicPanel",
    apiBase: "/paraClinic",
    requestApiPath: "/paraClinic/request",
    nameKey: "paraClinic",
    kind: "nameOnly",
    titleKey: "becomeParaClinicPageTitle",
    legendKey: "becomeParaClinicPageLegend",
    namespace: "becomeParaClinic",
  },
  pharmacy: {
    slug: "pharmacy",
    path: "/become/pharmacy",
    panelPath: "/pharmacypanel",
    apiBase: "/pharmacy",
    requestApiPath: "/pharmacy/request",
    nameKey: "pharmacy",
    kind: "nameOnly",
    titleKey: "becomePharmacyPageTitle",
    legendKey: "becomePharmacyPageLegend",
    namespace: "becomePharmacy",
  },
  insurance: {
    slug: "insurance",
    path: "/become/insurance",
    panelPath: "/insurancepanel",
    apiBase: "/insurance",
    requestApiPath: "/insurance/request",
    nameKey: "insurance",
    kind: "nameOnly",
    titleKey: "becomeInsurancePageTitle",
    legendKey: "becomeInsurancePageLegend",
    namespace: "becomeInsurance",
    licenseNumber: true,
  },
};

export const becomeOrgList: BecomeOrgConfig[] = Object.values(becomeOrgs);
