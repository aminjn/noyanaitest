"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import Box from "../UI/Box";
import { ta } from "@/Components/Admin/i18n/adminText";

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
}

const AdminManageAppConfigPage = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تنظیمات سیستم")}>
          <CreateForm<IAppConfig>
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              sipHost: { title: ta("آدرس سرور SIP"), type: "text" },
              sipUsername: { title: ta("نام کاربری SIP"), type: "text" },
              sipPassword: { title: ta("رمز عبور SIP"), type: "secret" },

              getIdentityInfoApiKey: {
                title: ta("کلید API استعلام هویت"),
                type: "secret",
              },
              matchNationalIdAndPhoneNumberApiKey: {
                title: ta("کلید API تطبیق کدملی و شماره موبایل"),
                type: "secret",
              },
              getMedicalSystemCodeApiKey: {
                title: ta("کلید API کد نظام پزشکی"),
                type: "secret",
              },
              podiumToken: { title: ta("توکن پودیوم"), type: "secret" },
              getMcCertificateApiKey: {
                title: ta("کلید API گواهی نظام پزشکی"),
                type: "secret",
              },

              bookingHorizonDays: {
                title: ta("بازه زمانی امکان رزرو نوبت (روز)"),
                type: "number",
              },
              recalculateDoctorAvailabilityInterval: {
                title: ta("فاصله محاسبه مجدد تقویم پزشکان (میلی‌ثانیه)"),
                type: "number",
              },

              analyticsVisitWindowSeconds: {
                title: ta("بازه ادغام بازدید تکراری صفحه (ثانیه)"),
                type: "number",
              },
              analyticsVisitorCookieDays: {
                title: ta("مدت اعتبار کوکی بازدیدکننده (روز)"),
                type: "number",
              },

              slugGenerationInterval: {
                title: ta("فاصله تولید خودکار اسلاگ (میلی‌ثانیه)"),
                type: "number",
              },

              callRingTimeoutMs: {
                title: ta("زمان انتظار زنگ خوردن تماس (میلی‌ثانیه)"),
                type: "number",
              },
              callMaxParticipants: {
                title: ta("حداکثر تعداد شرکت‌کنندگان یک تماس"),
                type: "number",
              },

              reservationActivationInterval: {
                title: ta("فاصله بررسی فعال‌سازی نوبت‌ها (میلی‌ثانیه)"),
                type: "number",
              },
              reservationReminderMinutesBefore: {
                title: ta("یادآوری نوبت چند دقیقه قبل از شروع (دقیقه)"),
                type: "number",
              },
              reservationReminderInterval: {
                title: ta("فاصله بررسی یادآوری نوبت‌ها (میلی‌ثانیه)"),
                type: "number",
              },
              reservationFinalizationInterval: {
                title: ta("فاصله بررسی نهایی‌سازی نوبت‌ها (میلی‌ثانیه)"),
                type: "number",
              },

              sepEnabled: {
                title: ta("فعال بودن پرداخت آنلاین (درگاه سامان / سپ)"),
                type: "bool",
              },
              sepTerminalId: {
                title: ta("شماره ترمینال درگاه سپ (TerminalId)"),
                type: "text",
              },
              sepCallbackBaseUrl: {
                title:
                  ta("آدرس عمومی بک‌اند برای بازگشت از درگاه (مثال: https://api.example.com)"),
                type: "text",
              },
              siteBaseUrl: {
                title: ta("آدرس عمومی سایت (مثال: https://example.com)"),
                type: "text",
              },
              sepAmountMultiplier: {
                title: ta("ضریب تبدیل مبلغ به ریال برای درگاه (تومان ← ریال = ۱۰)"),
                type: "number",
              },
              sepTokenExpiryMinutes: {
                title: ta("مدت اعتبار توکن پرداخت (دقیقه، ۲۰ تا ۳۶۰۰)"),
                type: "number",
              },
              onlinePaymentMinAmount: {
                title: ta("حداقل مبلغ شارژ کیف پول (تومان)"),
                type: "number",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageAppConfigPage;
