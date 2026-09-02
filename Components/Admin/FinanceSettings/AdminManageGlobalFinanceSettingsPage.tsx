"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";

// Mirrors backend Models/GlobalFinanceSettings.ts - the platform-wide
// default commission rates used as a fallback when a specific
// pharmacy/doctor/paraClinic doesn't have its own *FinanceSettings doc yet
// (see Components/Admin/Pharmacy/PharmacyCommissionTab.tsx and its
// doctor/paraClinic siblings). Routers/autoRouter.ts registers this model
// with `singleton: true`, so GET/POST both hit
// `${API}/auto/globalFinanceSettings` (no accessLevel set - only the
// "admin" role, not "notadmin", can reach it), mirroring
// AdminManageAppConfigPage.tsx.
export interface IGlobalFinanceSettings extends MongoDoc {
  singleton: "SINGLETON";
  defaultPharmacyCommissionPercent: number;
  defaultDoctorCommissionPercent: number;
  defaultParaClinicCommissionPercent: number;
}

const AdminManageGlobalFinanceSettingsPage = () => {
  const { data, error, mutate } = useSWR<IGlobalFinanceSettings>(
    `${API}/auto/globalFinanceSettings`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="تنظیمات مالی">
          <CreateForm<IGlobalFinanceSettings>
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/globalFinanceSettings`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              defaultPharmacyCommissionPercent: {
                title: "درصد کمیسیون پیش‌فرض داروخانه‌ها",
                type: "number",
              },
              defaultDoctorCommissionPercent: {
                title: "درصد کمیسیون پیش‌فرض پزشکان",
                type: "number",
              },
              defaultParaClinicCommissionPercent: {
                title: "درصد کمیسیون پیش‌فرض پاراکلینیک‌ها",
                type: "number",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageGlobalFinanceSettingsPage;
