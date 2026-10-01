"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminSectionHub from "../UI/AdminSectionHub";
import AdminMapSettingsTab from "./AdminMapSettingsTab";

// Mirrors backend Models/AppConfig.ts - the single source of truth for
// these settings now lives in the DB (singleton document), not .env.
// Routers/autoRouter.ts registers this model with `singleton: true`, so
// GET/POST both hit `${API}/auto/appConfig` (no accessLevel set - only the
// "admin" role, not "notadmin", can reach it).
export interface IAppConfig extends MongoDoc {
  singleton: "SINGLETON";

  sipHost: string;
  sipUsername: string;
  sipPassword: string;

  getIdentityInfoApiKey: string;
  matchNationalIdAndPhoneNumberApiKey: string;
  getMedicalSystemCodeApiKey: string;
  podiumToken: string;
  getMcCertificateApiKey: string;

  bookingHorizonDays: number;
  recalculateDoctorAvailabilityInterval: number;

  analyticsVisitWindowSeconds: number;
  analyticsVisitorCookieDays: number;

  slugGenerationInterval: number;

  callRingTimeoutMs: number;
  callMaxParticipants: number;

  reservationActivationInterval: number;
  reservationReminderMinutesBefore: number;
  reservationReminderInterval: number;
  reservationFinalizationInterval: number;

  // SEP (Saman) online payment gateway (2026-09)
  sepEnabled: boolean;
  sepTerminalId: string;
  sepCallbackBaseUrl: string;
  siteBaseUrl: string;
  sepAmountMultiplier: number;
  sepTokenExpiryMinutes: number;
  onlinePaymentMinAmount: number;
  withdrawalMinAmount: number;

  reservationNoShowNudgeMinutesAfterStart: number;
  reservationNoShowNudgeInterval: number;
}

// the general settings: one form, its parts as its own tabs. Booking,
// reminder, no-show and call timings live on the appointments page
// (/reservation?tab=settings, AdminBookingSettingsTab) since the 2026-10 audit.
const AdminGeneralSettingsTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تنظیمات عمومی")}>
          <CreateForm<IAppConfig>
            layout="tabs"
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              sipHost: { title: ta("آدرس سرور SIP"), type: "text", section: ta("تماس تلفنی (SIP)") },
              sipUsername: { title: ta("نام کاربری SIP"), type: "text", section: ta("تماس تلفنی (SIP)") },
              sipPassword: { title: ta("رمز عبور SIP"), type: "secret", section: ta("تماس تلفنی (SIP)") },

              getIdentityInfoApiKey: {
                title: ta("کلید API استعلام هویت"),
                type: "secret",
                section: ta("استعلام هویت و نظام پزشکی"),
              },
              matchNationalIdAndPhoneNumberApiKey: {
                title: ta("کلید API تطبیق کدملی و شماره موبایل"),
                type: "secret",
                section: ta("استعلام هویت و نظام پزشکی"),
              },
              getMedicalSystemCodeApiKey: {
                title: ta("کلید API کد نظام پزشکی"),
                type: "secret",
                section: ta("استعلام هویت و نظام پزشکی"),
              },
              podiumToken: { title: ta("توکن پودیوم"), type: "secret", section: ta("استعلام هویت و نظام پزشکی") },
              getMcCertificateApiKey: {
                title: ta("کلید API گواهی نظام پزشکی"),
                type: "secret",
                section: ta("استعلام هویت و نظام پزشکی"),
              },


              analyticsVisitWindowSeconds: {
                title: ta("بازه ادغام بازدید تکراری صفحه (ثانیه)"),
                type: "number",
                section: ta("آمار بازدید"),
              },
              analyticsVisitorCookieDays: {
                title: ta("مدت اعتبار کوکی بازدیدکننده (روز)"),
                type: "number",
                section: ta("آمار بازدید"),
              },

              slugGenerationInterval: {
                title: ta("فاصله تولید خودکار اسلاگ (میلی‌ثانیه)"),
                type: "number",
                section: ta("کارهای زمان‌بندی‌شده (با راه‌اندازی دوباره‌ی سرور اعمال می‌شود)"),
              },


            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

// تنظیمات سیستم (super admin): the general settings and the map provider
// (NexaMap, 2026-10) as tabs of one page.
const AdminManageAppConfigPage = () => (
  <AdminSectionHub
    title={ta("تنظیمات سیستم")}
    tabs={[
      { id: "general", title: ta("عمومی"), content: <AdminGeneralSettingsTab /> },
      { id: "map", title: ta("نقشه (نکسا مپ)"), content: <AdminMapSettingsTab /> },
    ]}
  />
);

export default AdminManageAppConfigPage;
