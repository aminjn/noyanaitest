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
  IBasePharmacyLicense,
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
  // Reference to the BasePharmacyLicense tier this record was purchased
  // from, plus the period it's valid for (2026-09) - unset for records
  // created before these fields existed, or for a hand-assigned license
  // with no expiry. See pharmacyController.resolveMyLicenseModules, which
  // treats a past expiresAt as no license at all.
  baseLicense?: string;
  startedAt?: Date;
  expiresAt?: Date;
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
            baseLicense: {
              title: "پلن مرجع",
              type: "nodes",
              multi: false,
              path: `${API}/auto/basePharmacyLicense`,
              getOptionLabel: (node) =>
                (node as IBasePharmacyLicense).displayName ||
                (node as IBasePharmacyLicense)._id,
              getOptionValue: (node) => (node as IBasePharmacyLicense)._id,
              getDefaultValue: (inp) => inp.baseLicense,
            },
            startedAt: { title: "تاریخ شروع", type: "date" },
            expiresAt: { title: "تاریخ انقضا", type: "date" },
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
