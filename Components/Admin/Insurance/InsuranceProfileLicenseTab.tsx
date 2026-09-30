"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import {
  insuranceDashboardModuleLabels,
  InsuranceDashboardModule,
  IBaseInsuranceLicense,
} from "../BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/InsuranceProfileLicense.ts - one doc per insurance
// (unique on `owner`), fetched here by filtering the generic
// GET /auto/insuranceProfileLicense list on the `owner` query param, same
// pattern as Components/Admin/Hospital/HospitalProfileLicenseTab.tsx.
export interface IInsuranceProfileLicense extends MongoDoc {
  owner: string;
  // Defaults to the purchased BaseInsuranceLicense's own displayName when an
  // insurance buys a license themselves, but freely editable here since an
  // admin assigning/editing an insurance's license by hand may want their
  // own label.
  displayName?: string;
  modules: InsuranceDashboardModule[];
  // Reference to the BaseInsuranceLicense tier this record was purchased
  // from, plus the period it's valid for (2026-09) - unset for records
  // created before these fields existed, or for a hand-assigned license
  // with no expiry. See insuranceController.resolveMyLicenseModules, which
  // treats a past expiresAt as no license at all.
  baseLicense?: string;
  startedAt?: Date;
  expiresAt?: Date;
}

const InsuranceProfileLicenseTab = ({ node }: { node: IInsurance }) => {
  const { data, error, mutate } = useSWR<IInsuranceProfileLicense[]>(
    `${API}/auto/insuranceProfileLicense?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm<IInsuranceProfileLicense>
          defaultValue={existing}
          hookProps={{
            path: existing
              ? `${API}/auto/insuranceProfileLicense/${existing._id}`
              : `${API}/auto/insuranceProfileLicense`,
            method: "POST",
            decorators: { owner: node._id },
            successCb: () => mutate(),
          }}
          renderer={{
            displayName: { title: ta("نام نمایشی"), type: "text" },
            baseLicense: {
              title: ta("پلن مرجع"),
              type: "nodes",
              multi: false,
              path: `${API}/auto/baseInsuranceLicense`,
              getOptionLabel: (node) =>
                (node as IBaseInsuranceLicense).displayName ||
                (node as IBaseInsuranceLicense)._id,
              getOptionValue: (node) => (node as IBaseInsuranceLicense)._id,
              getDefaultValue: (inp) => inp.baseLicense,
            },
            startedAt: { title: ta("تاریخ شروع"), type: "date" },
            expiresAt: { title: ta("تاریخ انقضا"), type: "date" },
            modules: {
              title: ta("منوهای قابل دسترسی"),
              type: "multiselect",
              options: insuranceDashboardModuleLabels,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default InsuranceProfileLicenseTab;
