"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IParaClinic } from "@/Components/Layout/ParaClinicPanelLayout";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import {
  paraClinicDashboardModuleLabels,
  ParaClinicDashboardModule,
} from "../BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";

// Mirrors backend Models/ParaClinicProfileLicense.ts - one doc per
// paraClinic (unique on `owner`), fetched here by filtering the generic
// GET /auto/paraClinicProfileLicense list on the `owner` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyProfileLicenseTab.tsx /
// Components/Admin/Clinic/ClinicProfileLicenseTab.tsx.
export interface IParaClinicProfileLicense extends MongoDoc {
  owner: string;
  // Defaults to the purchased BaseParaClinicLicense's own displayName when a
  // paraClinic buys a license themselves, but freely editable here since an
  // admin assigning/editing a paraClinic's license by hand may want their
  // own label.
  displayName?: string;
  modules: ParaClinicDashboardModule[];
}

const ParaClinicProfileLicenseTab = ({ node }: { node: IParaClinic }) => {
  const { data, error, mutate } = useSWR<IParaClinicProfileLicense[]>(
    `${API}/auto/paraClinicProfileLicense?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm<IParaClinicProfileLicense>
          defaultValue={existing}
          hookProps={{
            path: existing
              ? `${API}/auto/paraClinicProfileLicense/${existing._id}`
              : `${API}/auto/paraClinicProfileLicense`,
            method: "POST",
            decorators: { owner: node._id },
            successCb: () => mutate(),
          }}
          renderer={{
            displayName: { title: "نام نمایشی", type: "text" },
            modules: {
              title: "منوهای قابل دسترسی",
              type: "multiselect",
              options: paraClinicDashboardModuleLabels,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default ParaClinicProfileLicenseTab;
