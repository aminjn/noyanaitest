"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";

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
  defaultDoctorInPersonCommissionPercent: number;
  defaultParaClinicCommissionPercent: number;
  payoutHoldDays: number;
  withdrawalMinAmount?: number;
  // what one campaign SMS part costs beyond a plan's monthly quota (2026-10)
  campaignSmsPrice: number;
}

const AdminManageGlobalFinanceSettingsPage = () => {
  const { data, error, mutate } = useSWR<IGlobalFinanceSettings>(
    `${API}/auto/globalFinanceSettings`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تنظیمات مالی")}>
          <p style={{ marginBottom: "1rem", lineHeight: 1.9 }}>
            {ta("کمیسیون هنگام تسویه از سهم ارائه‌دهنده کم می‌شود و به قیمتی که بیمار یا خریدار می‌پردازد اضافه نمی‌شود. برای هر پزشک، داروخانه یا پاراکلینیک می‌توانید در صفحه‌ی خودش نرخ جداگانه بگذارید.")}
          </p>
          <CreateForm<IGlobalFinanceSettings>
            layout="sections"
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/globalFinanceSettings`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              defaultPharmacyCommissionPercent: {
                title: ta("درصد کمیسیون پیش‌فرض داروخانه‌ها"),
                type: "number",
                section: ta("کمیسیون"),
              },
              defaultDoctorCommissionPercent: {
                title: ta("درصد کمیسیون پزشکان - ویزیت آنلاین و خدمات فروشگاه"),
                type: "number",
                section: ta("کمیسیون"),
              },
              defaultDoctorInPersonCommissionPercent: {
                title: ta("درصد کمیسیون پزشکان - ویزیت حضوری (معمولاً ۰؛ هزینه با اشتراک)"),
                type: "number",
                section: ta("کمیسیون"),
              },
              defaultParaClinicCommissionPercent: {
                title: ta("درصد کمیسیون پیش‌فرض پاراکلینیک‌ها"),
                type: "number",
                section: ta("کمیسیون"),
              },
              payoutHoldDays: {
                title: ta("دوره‌ی تسویه (روز) - درآمد ارائه‌دهنده پس از این مدت قابل برداشت می‌شود"),
                type: "number",
                section: ta("تسویه و برداشت"),
              },
              withdrawalMinAmount: {
                title: ta("حداقل مبلغ برداشت از کیف پول (تومان)"),
                type: "number",
                price: true,
                section: ta("تسویه و برداشت"),
              },
              campaignSmsPrice: {
                title: ta("قیمت هر بخش پیامک کمپین (تومان) - بیشتر از سهمیه‌ی پلن، از کیف پول ارائه‌دهنده"),
                type: "number",
                section: ta("پیامک کمپین"),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageGlobalFinanceSettingsPage;
