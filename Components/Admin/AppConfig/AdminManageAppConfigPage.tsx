"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import Box from "../UI/Box";

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
        <WithTitle title="تنظیمات سیستم">
          <CreateForm<IAppConfig>
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              sipHost: { title: "آدرس سرور SIP", type: "text" },
              sipUsername: { title: "نام کاربری SIP", type: "text" },
              sipPassword: { title: "رمز عبور SIP", type: "text" },

              getIdentityInfoApiKey: {
                title: "کلید API استعلام هویت",
                type: "text",
              },
              matchNationalIdAndPhoneNumberApiKey: {
                title: "کلید API تطبیق کدملی و شماره موبایل",
                type: "text",
              },
              getMedicalSystemCodeApiKey: {
                title: "کلید API کد نظام پزشکی",
                type: "text",
              },
              podiumToken: { title: "توکن پودیوم", type: "text" },
              getMcCertificateApiKey: {
                title: "کلید API گواهی نظام پزشکی",
                type: "text",
              },

              bookingHorizonDays: {
                title: "بازه زمانی امکان رزرو نوبت (روز)",
                type: "number",
              },
              recalculateDoctorAvailabilityInterval: {
                title: "فاصله محاسبه مجدد تقویم پزشکان (میلی‌ثانیه)",
                type: "number",
              },

              analyticsVisitWindowSeconds: {
                title: "بازه ادغام بازدید تکراری صفحه (ثانیه)",
                type: "number",
              },
              analyticsVisitorCookieDays: {
                title: "مدت اعتبار کوکی بازدیدکننده (روز)",
                type: "number",
              },

              slugGenerationInterval: {
                title: "فاصله تولید خودکار اسلاگ (میلی‌ثانیه)",
                type: "number",
              },

              callRingTimeoutMs: {
                title: "زمان انتظار زنگ خوردن تماس (میلی‌ثانیه)",
                type: "number",
              },
              callMaxParticipants: {
                title: "حداکثر تعداد شرکت‌کنندگان یک تماس",
                type: "number",
              },

              reservationActivationInterval: {
                title: "فاصله بررسی فعال‌سازی نوبت‌ها (میلی‌ثانیه)",
                type: "number",
              },
              reservationReminderMinutesBefore: {
                title: "یادآوری نوبت چند دقیقه قبل از شروع (دقیقه)",
                type: "number",
              },
              reservationReminderInterval: {
                title: "فاصله بررسی یادآوری نوبت‌ها (میلی‌ثانیه)",
                type: "number",
              },
              reservationFinalizationInterval: {
                title: "فاصله بررسی نهایی‌سازی نوبت‌ها (میلی‌ثانیه)",
                type: "number",
              },

              sepEnabled: {
                title: "فعال بودن پرداخت آنلاین (درگاه سامان / سپ)",
                type: "bool",
              },
              sepTerminalId: {
                title: "شماره ترمینال درگاه سپ (TerminalId)",
                type: "text",
              },
              sepCallbackBaseUrl: {
                title:
                  "آدرس عمومی بک‌اند برای بازگشت از درگاه (مثال: https://api.example.com)",
                type: "text",
              },
              siteBaseUrl: {
                title: "آدرس عمومی سایت (مثال: https://example.com)",
                type: "text",
              },
              sepAmountMultiplier: {
                title: "ضریب تبدیل مبلغ به ریال برای درگاه (تومان ← ریال = ۱۰)",
                type: "number",
              },
              sepTokenExpiryMinutes: {
                title: "مدت اعتبار توکن پرداخت (دقیقه، ۲۰ تا ۳۶۰۰)",
                type: "number",
              },
              onlinePaymentMinAmount: {
                title: "حداقل مبلغ شارژ کیف پول (تومان)",
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
