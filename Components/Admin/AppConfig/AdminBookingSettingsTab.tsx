"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import { IAppConfig } from "./AdminManageAppConfigPage";

// تنظیمات نوبت‌دهی (2026-10 audit): the booking, reminder, no-show and
// visit-call timings of AppConfig, moved out of the system settings to sit
// next to the appointments they govern (like Doctolib Pro's booking rules
// living with the agenda). Same singleton document as /appConfig; the form
// posts only the fields changed here.
type BookingSettings = Pick<
  IAppConfig,
  | "bookingHorizonDays"
  | "reservationReminderMinutesBefore"
  | "reservationNoShowNudgeMinutesAfterStart"
  | "callRingTimeoutMs"
  | "callMaxParticipants"
  | "recalculateDoctorAvailabilityInterval"
  | "reservationActivationInterval"
  | "reservationReminderInterval"
  | "reservationFinalizationInterval"
  | "reservationNoShowNudgeInterval"
>;

const AdminBookingSettingsTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const jobs = ta("کارهای زمان‌بندی‌شده (با راه‌اندازی دوباره‌ی سرور اعمال می‌شود)");

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("تنظیمات نوبت‌دهی")}>
          <CreateForm<BookingSettings>
            layout="tabs"
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              bookingHorizonDays: {
                title: ta("بازه زمانی امکان رزرو نوبت (روز)"),
                type: "number",
                section: ta("نوبت‌دهی و یادآوری"),
              },
              reservationReminderMinutesBefore: {
                title: ta("یادآوری نوبت چند دقیقه قبل از شروع (دقیقه)"),
                type: "number",
                section: ta("نوبت‌دهی و یادآوری"),
              },
              reservationNoShowNudgeMinutesAfterStart: {
                title: ta("یادآوری حضور چند دقیقه بعد از شروع نوبت (دقیقه)"),
                type: "number",
                section: ta("نوبت‌دهی و یادآوری"),
              },
              callRingTimeoutMs: {
                title: ta("زمان انتظار زنگ خوردن تماس (میلی‌ثانیه)"),
                type: "number",
                section: ta("تماس تصویری و صوتی"),
              },
              callMaxParticipants: {
                title: ta("حداکثر تعداد شرکت‌کنندگان یک تماس"),
                type: "number",
                section: ta("تماس تصویری و صوتی"),
              },
              recalculateDoctorAvailabilityInterval: {
                title: ta("فاصله محاسبه مجدد تقویم پزشکان (میلی‌ثانیه)"),
                type: "number",
                section: jobs,
              },
              reservationActivationInterval: {
                title: ta("فاصله بررسی فعال‌سازی نوبت‌ها (میلی‌ثانیه)"),
                type: "number",
                section: jobs,
              },
              reservationReminderInterval: {
                title: ta("فاصله بررسی یادآوری نوبت‌ها (میلی‌ثانیه)"),
                type: "number",
                section: jobs,
              },
              reservationFinalizationInterval: {
                title: ta("فاصله بررسی نهایی‌سازی نوبت‌ها (میلی‌ثانیه)"),
                type: "number",
                section: jobs,
              },
              reservationNoShowNudgeInterval: {
                title: ta("فاصله بررسی یادآوری حضور (میلی‌ثانیه)"),
                type: "number",
                section: jobs,
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminBookingSettingsTab;
