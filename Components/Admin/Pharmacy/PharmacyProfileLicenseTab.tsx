"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import {
  pharmacyDashboardModuleLabels,
  PharmacyDashboardModule,
} from "../BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";

// Mirrors backend Models/PharmacyProfileLicense.ts - one doc per pharmacy
// (unique on `owner`), fetched here by filtering the generic
// GET /auto/pharmacyProfileLicense list on the `owner` query param, same
// pattern as Components/Admin/DoctorProfile/DoctorProfileLicenseTab.tsx.
export interface IPharmacyProfileLicense extends MongoDoc {
  owner: string;
  // Defaults to the purchased BasePharmacyLicense's own displayName when a
  // pharmacy buys a license themselves, but freely editable here since an
  // admin assigning/editing a pharmacy's license by hand may want their own
  // label.
  displayName?: string;
  modules: PharmacyDashboardModule[];
}

const PharmacyProfileLicenseTab = ({ node }: { node: IPharmacy }) => {
  const { data, error, mutate } = useSWR<IPharmacyProfileLicense[]>(
    `${API}/auto/pharmacyProfileLicense?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm<IPharmacyProfileLicense>
          defaultValue={existing}
          hookProps={{
            path: existing
              ? `${API}/auto/pharmacyProfileLicense/${existing._id}`
              : `${API}/auto/pharmacyProfileLicense`,
            method: "POST",
            decorators: { owner: node._id },
            successCb: () => mutate(),
          }}
          renderer={{
            displayName: { title: "نام نمایشی", type: "text" },
            modules: {
              title: "منوهای قابل دسترسی",
              type: "multiselect",
              options: pharmacyDashboardModuleLabels,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default PharmacyProfileLicenseTab;
