"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

// Mirrors backend Models/GlobalTaxSettings.ts - the platform-wide default
// tax rates used as a fallback when a specific pharmacy/doctor/clinic/
// paraClinic doesn't have its own tax field set (see
// Components/Admin/Pharmacy/PharmacyTaxTab.tsx and its doctor/clinic/
// paraClinic siblings). Routers/autoRouter.ts registers this model with
// `singleton: true`, so GET/POST both hit `${API}/auto/globalTaxSettings`
// (no accessLevel set - only the "admin" role, not "notadmin", can reach
// it), mirroring AdminManageGlobalFinanceSettingsPage.tsx.
export interface IGlobalTaxSettings extends MongoDoc {
  singleton: "SINGLETON";
  defaultPharmacyTaxPercent: number;
  defaultDoctorVisitTaxPercent: number;
  defaultDoctorServiceTaxPercent: number;
  defaultClinicTaxPercent: number;
  defaultParaClinicTaxPercent: number;
}

const AdminManageGlobalTaxSettingsPage = () => {
  const { data, error, mutate } = useSWR<IGlobalTaxSettings>(
    `${API}/auto/globalTaxSettings`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تنظیمات مالیاتی")}>
          <p style={{ marginBottom: "1rem", lineHeight: 1.9 }}>
            {ta("پزشک یا مرکز فروشنده است: مالیات فقط برای ارائه‌دهنده‌ای که در سامانه‌ی مودیان فعال است به صورتحساب اضافه می‌شود و همراه درآمدش به خودش پرداخت می‌شود تا در صورتحساب الکترونیک خودش اعلام کند. نرخ ویزیت به این ترتیب است: نرخ مرکز محل ویزیت (کلینیک یا بیمارستان)، بعد نرخ خود پزشک، بعد پیش‌فرض این صفحه.")}
          </p>
          <CreateForm<IGlobalTaxSettings>
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/globalTaxSettings`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              defaultPharmacyTaxPercent: {
                title: ta("درصد مالیات پیش‌فرض داروخانه‌ها"),
                type: "number",
              },
              defaultDoctorVisitTaxPercent: {
                title: ta("درصد مالیات پیش‌فرض ویزیت پزشکان"),
                type: "number",
              },
              defaultDoctorServiceTaxPercent: {
                title: ta("درصد مالیات پیش‌فرض خدمات پزشکان"),
                type: "number",
              },
              defaultParaClinicTaxPercent: {
                title: ta("درصد مالیات پیش‌فرض پاراکلینیک‌ها"),
                type: "number",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageGlobalTaxSettingsPage;
