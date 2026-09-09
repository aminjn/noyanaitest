"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import {
  doctorDashboardModuleLabels,
  DoctorDashboardModule,
  IBaseDoctorLicense,
} from "../BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";

// Mirrors backend Models/DoctorProfileLicense.ts - one doc per doctor
// (unique on `owner`), fetched here by filtering the generic
// GET /auto/doctorProfileLicense list on the `owner` query param, same
// pattern as Components/Admin/DoctorProfile/DoctorCommissionTab.tsx.
export interface IDoctorProfileLicense extends MongoDoc {
  owner: string;
  // Defaults to the purchased BaseDoctorLicense's own displayName when a
  // doctor buys a license themselves, but freely editable here since an
  // admin assigning/editing a doctor's license by hand may want their own
  // label.
  displayName?: string;
  modules: DoctorDashboardModule[];
  // Reference to the BaseDoctorLicense tier this record was purchased
  // from, plus the period it's valid for (2026-09) - unset for records
  // created before these fields existed, or for a hand-assigned license
  // with no expiry. See doctorController.resolveMyLicenseModules, which
  // treats a past expiresAt as no license at all.
  baseLicense?: string;
  startedAt?: Date;
  expiresAt?: Date;
}

const DoctorProfileLicenseTab = ({ node }: { node: IDoctorProfile }) => {
  const { data, error, mutate } = useSWR<IDoctorProfileLicense[]>(
    `${API}/auto/doctorProfileLicense?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const existing = data?.[0];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <CreateForm<IDoctorProfileLicense>
          defaultValue={existing}
          hookProps={{
            path: existing
              ? `${API}/auto/doctorProfileLicense/${existing._id}`
              : `${API}/auto/doctorProfileLicense`,
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
              path: `${API}/auto/baseDoctorLicense`,
              getOptionLabel: (node) =>
                (node as IBaseDoctorLicense).displayName ||
                (node as IBaseDoctorLicense)._id,
              getOptionValue: (node) => (node as IBaseDoctorLicense)._id,
              getDefaultValue: (inp) => inp.baseLicense,
            },
            startedAt: { title: "تاریخ شروع", type: "date" },
            expiresAt: { title: "تاریخ انقضا", type: "date" },
            modules: {
              title: "منوهای قابل دسترسی",
              type: "multiselect",
              options: doctorDashboardModuleLabels,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorProfileLicenseTab;
