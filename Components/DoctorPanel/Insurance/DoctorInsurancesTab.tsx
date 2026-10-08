import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { API } from "@/Components/config";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import {
  IInsuranceCategory,
  InsuranceCategoryPopulation,
} from "@/Components/Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";
import {
  IInsuranceTag,
  InsuranceTagPopulation,
} from "@/Components/Admin/InsuranceTag/AdminManageInsuranceTagsPage";
import {
  IInsurancePlan,
  InsurancePlanPopulation,
} from "@/Components/Admin/Insurance/AdminManageInsurancePage";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import ProviderInsurerContracts from "@/Components/InsuranceContracts/ProviderInsurerContracts";

export type InsurancePopulation = Population<{
  Category: InsuranceCategoryPopulation;
  Tags: InsuranceTagPopulation;
  Plans: InsurancePlanPopulation;
  User: UserPopulation;
}>;

export interface IInsurance<
  T extends InsurancePopulation = InsurancePopulation,
> extends MongoDoc {
  name?: string;
  active: boolean;
  order: number;
  category?: T["Category"] extends InsuranceCategoryPopulation
    ? IInsuranceCategory<T["Category"]>
    : string;
  tags: T["Tags"] extends InsuranceTagPopulation
    ? IInsuranceTag<T["Tags"]>[]
    : string[];
  establishment?: string;
  // «شماره‌ی مجوز بیمه مرکزی» (2026-10), shown on the public page
  licenseNumber?: string;
  // a basic (public) insurer; a centre's «بیمه پایه» follows it
  isBasic?: boolean;
  membersCount?: string;
  // who accepts it on the site, counted live by the public endpoints
  network?: InsuranceNetwork;
  // the insurer's public inquiry form (/f/<slug>, its CRM sales pipeline),
  // where a plan is asked for; null when it has none switched on
  requestForm?: string | null;
  image?: string;
  slug?: string;
  phone?: string;
  summary?: string;
  coverages: string[];
  advantages: string[];
  website?: string;
  address?: string;
  location?: { type: "Point"; coordinates?: [number, number] };
  plans: T["Plans"] extends InsurancePlanPopulation
    ? IInsurancePlan<T["Plans"]>[]
    : never;
  averageScore?: number;
  commentCount?: number;
  // Org-account field (2026-09), mirroring IHospital - an insurance's own
  // login/panel (insuranceController/insuranceRouter).
  user?: T["User"] extends UserPopulation ? IUser : string;
}

export type InsuranceNetwork = {
  doctors: number;
  clinics: number;
  hospitals: number;
  paraClinics: number;
  // pharmacies that list the insurer (2026-10)
  pharmacies?: number;
};

export type DoctorInsurancePopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Insurance: InsurancePopulation;
}>;

export interface IDoctorInsurance<
  T extends DoctorInsurancePopulation = DoctorInsurancePopulation,
> extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  insurance: T["Insurance"] extends InsurancePopulation
    ? IInsurance<T["Insurance"]> | null
    : string;
}

// The doctor's insurers (2026-10): contracts the insurer confirms, in the
// one block every provider panel shares (Components/InsuranceContracts).
// Adding / removing an insurer one-sidedly is gone.
const DoctorInsurancesTab = () => {
  const hasAccess = useDoctorAcl();
  return (
    <ProviderInsurerContracts
      base={`${API}/doctor/insurer-contract`}
      canEdit={hasAccess("mutateInsurance")}
    />
  );
};

export default DoctorInsurancesTab;
