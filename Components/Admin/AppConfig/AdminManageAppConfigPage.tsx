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
import AdminAiHub from "./Ai/AdminAiHub";
import AdminIntegrationsOverviewTab from "./AdminIntegrationsOverviewTab";
import AdminSmsSettingsPage from "../Sms/AdminSmsSettingsPage";
import AdminManageSmsPatternsPage from "../SmsPatterns/AdminManageSmsPatternsPage";

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
  sepTokenExpiryMinutes: number;
  onlinePaymentMinAmount: number;
  withdrawalMinAmount: number;
  // seller response deadlines of cart orders (2026-10, backend
  // Lib/orderResponse.ts): hours from payment, and the advance warning
  orderResponseHoursPharmacy?: number;
  orderResponseHoursLab?: number;
  orderResponseWarnHours?: number;

  reservationNoShowNudgeMinutesAfterStart: number;
  reservationNoShowNudgeInterval: number;

  // booking rules (2026-10): the patient's free-cancel window, and the
  // 24-hour / 2-hour reminders (booking settings tab)
  patientFreeCancelHours?: number;
  reservationReminder24hEnabled?: boolean;
  reservationReminder2hEnabled?: boolean;

  // the emergency note of the disease / symptom / drug pages (General)
  emergencyNumber?: string;
  emergencyNoteEnabled?: boolean;
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
              // read by payment returns, CRM links and campaign SMS alike
              siteBaseUrl: {
                title: ta("آدرس عمومی سایت (مثال: https://example.com)"),
                type: "text", ltr: true,
                section: ta("سایت"),
              },
              // the "in an emergency call ..." line of the health pages
              // (2026-10): number and switch here, wording per language in
              // the UI texts (seeDoctorWarningNote, drugSafetyNote)
              emergencyNoteEnabled: {
                title: ta("نمایش یادداشت اورژانس در صفحه‌های بیماری، علائم و دارو"),
                type: "bool",
                section: ta("سایت"),
              },
              emergencyNumber: {
                title: ta("شماره‌ی اورژانس"),
                type: "text", ltr: true,
                section: ta("سایت"),
                hint: ta("همین شماره در متن یادداشت نشان داده می‌شود. خود متن را برای هر زبان در «زبان و ترجمه ← متن‌های رابط کاربری» (کلیدهای seeDoctorWarningNote و drugSafetyNote) ویرایش کنید."),
              },
              sipHost: { title: ta("آدرس سرور SIP"), type: "text", ltr: true, section: ta("تماس تلفنی (SIP)") },
              sipUsername: { title: ta("نام کاربری SIP"), type: "text", ltr: true, section: ta("تماس تلفنی (SIP)") },
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

// تنظیمات سیستم (super admin): every outside service and its keys in one
// page (2026-10) - an overview first, then general, SMS, map and AI.
const AdminSmsTab = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <AdminSmsSettingsPage />
    <AdminManageSmsPatternsPage />
  </div>
);

const AdminManageAppConfigPage = () => (
  <AdminSectionHub
    title={ta("تنظیمات سیستم")}
    tabs={[
      { id: "services", title: ta("سرویس‌ها و کلیدها"), content: <AdminIntegrationsOverviewTab /> },
      { id: "general", title: ta("عمومی"), content: <AdminGeneralSettingsTab /> },
      { id: "sms", title: ta("پیامک"), content: <AdminSmsTab /> },
      { id: "map", title: ta("نقشه (نکسا مپ)"), content: <AdminMapSettingsTab /> },
      { id: "ai", title: ta("هوش مصنوعی"), content: <AdminAiHub /> },
    ]}
  />
);

export default AdminManageAppConfigPage;
