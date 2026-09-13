"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import {
  userAlertEvents,
  userAlertEventLabels,
  UserAlertEvent,
} from "../UserAlert/AdminManageUserAlertsPage";

// Every entry here is one SMS a reservation's own doctor/patient (not
// staff) can receive about that specific reservation - mirrors backend
// Models/Reservation.ts's reservationSmsEvents. Kept in sync by hand (front
// and back are separate packages, same convention as userAlertEvents
// above) - adding an event to both arrays (and a label here) is the only
// change needed for its pattern field to show up on this page.
export const reservationSmsEvents = [
  "newReservationDoctor",
  "newReservationPatient",
  "upcomingReservationDoctor",
  "upcomingReservationPatient",
  "reservationInProgressDoctorNoShow",
  "reservationInProgressPatientNoShow",
] as const;

export type ReservationSmsEvent = (typeof reservationSmsEvents)[number];

export const reservationSmsEventLabels: Record<ReservationSmsEvent, string> = {
  newReservationDoctor: "نوبت جدید - پزشک",
  newReservationPatient: "نوبت جدید - بیمار",
  upcomingReservationDoctor: "یادآوری نوبت - پزشک",
  upcomingReservationPatient: "یادآوری نوبت - بیمار",
  reservationInProgressDoctorNoShow: "یادآوری حضور در نوبت - پزشک",
  reservationInProgressPatientNoShow: "یادآوری حضور در نوبت - بیمار",
};

// Type-level camelCase -> snake_case (lowercase), e.g.
// "newBecomeDoctorRequest" -> "new_become_doctor_request". Mirrors backend
// Lib/smsPatternName.ts's SnakeCase helper exactly - keep the two in sync.
// Only used so SmsPatternNameFor below is a literal type (e.g.
// "NEW_BECOME_DOCTOR_REQUEST_PATTERN") instead of plain `string`.
type SnakeCase<S extends string> = S extends `${infer Head}${infer Rest}`
  ? Head extends Uppercase<Head>
    ? `_${Head}${SnakeCase<Rest>}`
    : `${Head}${SnakeCase<Rest>}`
  : S;

// The SMS pattern field name for a given event, e.g.
// SmsPatternNameFor<"newBecomeDoctorRequest"> is the literal type
// "NEW_BECOME_DOCTOR_REQUEST_PATTERN". Mirrors backend
// Lib/smsPatternName.ts's SmsPatternNameFor.
export type SmsPatternNameFor<E extends string> =
  `${Uppercase<SnakeCase<E>>}_PATTERN`;

export type SmsPatternName =
  | "OTP_PATTERN"
  | SmsPatternNameFor<UserAlertEvent>
  | SmsPatternNameFor<ReservationSmsEvent>;

// camelCase event name -> SCREAMING_SNAKE_CASE + "_PATTERN", e.g.
// "newBecomeDoctorRequest" -> "NEW_BECOME_DOCTOR_REQUEST_PATTERN". Mirrors
// backend Lib/smsPatternName.ts's smsPatternNameForEvent exactly - keep the
// two in sync.
export const smsPatternNameForEvent = <E extends string>(
  event: E,
): SmsPatternNameFor<E> =>
  `${event.replace(/([A-Z])/g, "_$1").toUpperCase()}_PATTERN` as SmsPatternNameFor<E>;

// Mirrors backend Models/SmsPatterns.ts - the IPPanel pattern codes used by
// Lib/sendSms.ts's sendSmsRaw (its `code: pattern` field). Field keys are
// the same-named env vars each one defaults from: the fixed OTP_PATTERN,
// plus one dedicated pattern per userAlertEvents entry and per
// reservationSmsEvents entry (2026-09 audit finding: every staff-alert
// event used to share one generic "STAFF_ALERT_PATTERN" - each now gets its
// own field/pattern so e.g. a new support ticket and a new
// become-organization request, or a doctor's and a patient's reservation
// SMS, are never sent with the same gateway pattern). Routers/autoRouter.ts
// registers this model with `singleton: true`, so GET/POST both hit
// `${API}/auto/smsPatterns` (no accessLevel set - only the "admin" role,
// not "notadmin", can reach it), mirroring AdminManageAppConfigPage.tsx.
export type ISmsPatterns = MongoDoc & {
  singleton: "SINGLETON";
} & Record<SmsPatternName, string>;

// Built once from userAlertEvents + reservationSmsEvents, so a new event
// automatically gets its own text field here without hand-listing pattern
// names.
const patternFormRenderer = {
  OTP_PATTERN: {
    title: "پترن کد تایید (OTP)",
    type: "text",
  },
} as FormRenderer<ISmsPatterns>;

for (const event of userAlertEvents) {
  (patternFormRenderer as Record<string, unknown>)[
    smsPatternNameForEvent(event)
  ] = {
    title: `پترن پیامک - ${userAlertEventLabels[event]}`,
    type: "text",
  };
}

for (const event of reservationSmsEvents) {
  (patternFormRenderer as Record<string, unknown>)[
    smsPatternNameForEvent(event)
  ] = {
    title: `پترن پیامک - ${reservationSmsEventLabels[event]}`,
    type: "text",
  };
}

const AdminManageSmsPatternsPage = () => {
  const { data, error, mutate } = useSWR<ISmsPatterns>(
    `${API}/auto/smsPatterns`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="پترن‌های پیامک">
          <CreateForm<ISmsPatterns>
            defaultValue={data}
            hookProps={{
              path: `${API}/auto/smsPatterns`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={patternFormRenderer}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSmsPatternsPage;
