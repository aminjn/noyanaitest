"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IClinic } from "./AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import {
  clinicDashboardModuleLabels,
  ClinicDashboardModule,
  IBaseClinicLicense,
} from "../BaseClinicLicense/AdminManageBaseClinicLicensesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/ClinicProfileLicense.ts - one doc per clinic
// (unique on `owner`), fetched here by filtering the generic
// GET /auto/clinicProfileLicense list on the `owner` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyProfileLicenseTab.tsx.
export interface IClinicProfileLicense extends MongoDoc {
  owner: string;
  // Defaults to the purchased BaseClinicLicense's own displayName when a
  // clinic buys a license themselves, but freely editable here since an
  // admin assigning/editing a clinic's license by hand may want their own
  // label.
  displayName?: string;
  modules: ClinicDashboardModule[];
  // Reference to the BaseClinicLicense tier this record was purchased
  // from, plus the period it's valid for (2026-09) - unset for records
  // created before these fields existed, or for a hand-assigned license
  // with no expiry. See clinicController.resolveMyLicenseModules, which
  // treats a past expiresAt as no license at all.
  baseLicense?: string;
  startedAt?: Date;
  expiresAt?: Date;
}

const ClinicProfileLicenseTab = ({ node }: { node: IClinic }) => {
  const { data, error, mutate } = useSWR<IClinicProfileLicense[]>(
    `${API}/auto/clinicProfileLicense?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm<IClinicProfileLicense>
          defaultValue={existing}
          hookProps={{
            path: existing
              ? `${API}/auto/clinicProfileLicense/${existing._id}`
              : `${API}/auto/clinicProfileLicense`,
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
              path: `${API}/auto/baseClinicLicense`,
              getOptionLabel: (node) =>
                (node as IBaseClinicLicense).displayName ||
                (node as IBaseClinicLicense)._id,
              getOptionValue: (node) => (node as IBaseClinicLicense)._id,
              getDefaultValue: (inp) => inp.baseLicense,
            },
            startedAt: { title: ta("تاریخ شروع"), type: "date" },
            expiresAt: { title: ta("تاریخ انقضا"), type: "date" },
            modules: {
              title: ta("منوهای قابل دسترسی"),
              type: "multiselect",
              options: clinicDashboardModuleLabels,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default ClinicProfileLicenseTab;
