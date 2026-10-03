"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IHospital } from "./AdminManageHospitalsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import {
  hospitalDashboardModuleLabels,
  HospitalDashboardModule,
  IBaseHospitalLicense,
} from "../BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/HospitalProfileLicense.ts - one doc per hospital
// (unique on `owner`), fetched here by filtering the generic
// GET /auto/hospitalProfileLicense list on the `owner` query param, same
// pattern as Components/Admin/Pharmacy/PharmacyProfileLicenseTab.tsx.
export interface IHospitalProfileLicense extends MongoDoc {
  owner: string;
  // Defaults to the purchased BaseHospitalLicense's own displayName when a
  // hospital buys a license themselves, but freely editable here since an
  // admin assigning/editing a hospital's license by hand may want their own
  // label.
  displayName?: string;
  modules: HospitalDashboardModule[];
  // Reference to the BaseHospitalLicense tier this record was purchased
  // from, plus the period it's valid for (2026-09) - unset for records
  // created before these fields existed, or for a hand-assigned license
  // with no expiry. See hospitalController.resolveMyLicenseModules, which
  // treats a past expiresAt as no license at all.
  baseLicense?: string;
  startedAt?: Date;
  expiresAt?: Date;
}

const HospitalProfileLicenseTab = ({ node }: { node: IHospital }) => {
  const { data, error, mutate } = useSWR<IHospitalProfileLicense[]>(
    `${API}/auto/hospitalProfileLicense?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm<IHospitalProfileLicense>
          defaultValue={existing}
          hookProps={{
            path: existing
              ? `${API}/auto/hospitalProfileLicense/${existing._id}`
              : `${API}/auto/hospitalProfileLicense`,
            method: "POST",
            decorators: { owner: node._id },
            successCb: () => mutate(),
          }}
          renderer={{
            displayName: { title: ta("نام نمایشی (خالی = نام پلن)"), type: "text" },
            baseLicense: {
              title: ta("پلن مرجع"),
              type: "nodes",
              multi: false,
              path: `${API}/auto/baseHospitalLicense?isActive=true`,
              getOptionLabel: (node) =>
                (node as IBaseHospitalLicense).displayName ||
                (node as IBaseHospitalLicense)._id,
              getOptionValue: (node) => (node as IBaseHospitalLicense)._id,
              getDefaultValue: (inp) => inp.baseLicense,
            },
            startedAt: { title: ta("تاریخ شروع"), type: "date" },
            expiresAt: { title: ta("تاریخ انقضا"), type: "date" },
            modules: {
              title: ta("منوها (فقط پلن سفارشی، بدون پلن مرجع)"),
              type: "multiselect",
              options: hospitalDashboardModuleLabels,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default HospitalProfileLicenseTab;
