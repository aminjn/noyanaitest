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
} from "../BaseClinicLicense/AdminManageBaseClinicLicensesPage";

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
            displayName: { title: "نام نمایشی", type: "text" },
            modules: {
              title: "منوهای قابل دسترسی",
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
