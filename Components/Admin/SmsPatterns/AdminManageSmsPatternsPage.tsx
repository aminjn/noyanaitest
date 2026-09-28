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
  // Sent instead of newReservationPatient when the booking was made for a
  // relative (Models/UserRelative.ts on the backend) rather than by the
  // patient themselves - see backend Services/reservationSmsService.ts's
  // isBookedForRelative (2026-09).
  "newReservationRelativePatient",
  "upcomingReservationDoctor",
  "upcomingReservationPatient",
  "reservationInProgressDoctorNoShow",
  "reservationInProgressPatientNoShow",
] as const;

export type ReservationSmsEvent = (typeof reservationSmsEvents)[number];

export const reservationSmsEventLabels: Record<ReservationSmsEvent, string> = {
  newReservationDoctor: "نوبت جدید - پزشک",
  newReservationPatient: "نوبت جدید - بیمار",
  newReservationRelativePatient: "نوبت جدید - بیمار (رزرو توسط دیگری)",
  upcomingReservationDoctor: "یادآوری نوبت - پزشک",
  upcomingReservationPatient: "یادآوری نوبت - بیمار",
  reservationInProgressDoctorNoShow: "یادآوری حضور در نوبت - پزشک",
  reservationInProgressPatientNoShow: "یادآوری حضور در نوبت - بیمار",
};

// The exact {placeholder} variable names Services/reservationSmsService.ts
// sends for each event - mirrors backend Models/Reservation.ts's
// ReservationSmsVariables. Shown on this page (see patternFormRenderer
// below) so whoever creates the matching pattern on the gateway's own
// panel (e.g. IPPanel) knows which placeholders to use in its fixed text -
// this is the whole point of the 2026-09 fix away from a generic
// {title,message} pair.
export const reservationSmsEventVariables: Record<
  ReservationSmsEvent,
  string[]
> = {
  newReservationDoctor: ["reservationId", "patientName", "date", "time"],
  newReservationPatient: ["reservationId", "doctorName", "date", "time"],
  newReservationRelativePatient: [
    "reservationId",
    "doctorName",
    "date",
    "time",
    "bookerName",
  ],
  upcomingReservationDoctor: [
    "reservationId",
    "minutesBefore",
    "date",
    "time",
  ],
  upcomingReservationPatient: [
    "reservationId",
    "minutesBefore",
    "date",
    "time",
  ],
  reservationInProgressDoctorNoShow: ["reservationId"],
  reservationInProgressPatientNoShow: ["reservationId"],
};

// Every entry here is one SMS an order's own buyer or an involved seller
// org can receive about that specific order - mirrors backend
// Models/Order.ts's orderSmsEvents. Only three seller-side events exist
// (no clinic): nothing a Clinic owns can appear as an order item today, see
// that file's comment.
export const orderSmsEvents = [
  "newOrderUser",
  "newOrderPharmacy",
  "newOrderDoctor",
  "newOrderParaClinic",
] as const;

export type OrderSmsEvent = (typeof orderSmsEvents)[number];

export const orderSmsEventLabels: Record<OrderSmsEvent, string> = {
  newOrderUser: "سفارش جدید - خریدار",
  newOrderPharmacy: "سفارش جدید - داروخانه",
  newOrderDoctor: "سفارش جدید - پزشک",
  newOrderParaClinic: "سفارش جدید - پاراکلینیک",
};

// The exact {placeholder} variable names Services/orderSmsService.ts sends
// for each event - mirrors backend Models/Order.ts's OrderSmsVariables. See
// reservationSmsEventVariables above for why this exists.
export const orderSmsEventVariables: Record<OrderSmsEvent, string[]> = {
  newOrderUser: ["orderId", "total"],
  newOrderPharmacy: ["orderId", "customerName"],
  newOrderDoctor: ["orderId", "customerName"],
  newOrderParaClinic: ["orderId", "customerName"],
};

// The exact {placeholder} variable names Services/userAlertService.ts sends
// for each staff-alert event - mirrors backend Models/UserAlert.ts's
// UserAlertSmsVariables. Hand-kept in sync the same way userAlertEvents/
// userAlertEventLabels already are (imported from AdminManageUserAlertsPage
// above) - front and back are separate packages, so there's no way to share
// this literally. See reservationSmsEventVariables above for why this
// exists.
export const userAlertEventVariables: Record<UserAlertEvent, string[]> = {
  newTicket: ["ticketId", "userPhone", "ticketTitle"],
  newWithdrawalRequest: ["requestId", "userPhone", "amount"],
  newBecomeDoctorRequest: ["requestId", "userPhone"],
  newBecomePharmacyRequest: ["requestId", "userPhone"],
  newBecomeClinicRequest: ["requestId", "userPhone"],
  newBecomeParaClinicRequest: ["requestId", "userPhone"],
  newBecomeHospitalRequest: ["requestId", "userPhone"],
  newBecomeInsuranceRequest: ["requestId", "userPhone"],
  newClinicAdditionRequest: ["requestId", "name"],
  newPharmacyAdditionRequest: ["requestId", "name"],
  newHospitalAdditionRequest: ["requestId", "name"],
  newInsuranceAdditionRequest: ["requestId", "name"],
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
  | "SECRETARY_INVITE_PATTERN"
  | SmsPatternNameFor<UserAlertEvent>
  | SmsPatternNameFor<ReservationSmsEvent>
  | SmsPatternNameFor<OrderSmsEvent>;

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

// Each pattern is a fixed text configured in the SMS gateway's own provider
// panel (e.g. IPPanel), with named placeholders substituted in - not a
// generic {title,message} pair (2026-09 correction). This turns a
// variable-name list into the "(متغیرها: ...)" suffix shown on every field's
// title below, so whoever configures a pattern on the gateway's side knows
// exactly which placeholders that pattern's text must contain.
const withVariables = (title: string, variables: string[]): string =>
  `${title} (متغیرها: ${variables.join("، ")})`;

// Built once from userAlertEvents + reservationSmsEvents + orderSmsEvents,
// so a new event automatically gets its own text field here without
// hand-listing pattern names.
const patternFormRenderer = {
  OTP_PATTERN: {
    title: "پترن کد تایید (OTP) (متغیرها: OTP)",
    type: "text",
  },
  SECRETARY_INVITE_PATTERN: {
    title: "پترن دعوت منشی (متغیرها: owner) — خالی بماند یعنی پیامک ارسال نمی‌شود",
    type: "text",
  },
} as FormRenderer<ISmsPatterns>;

for (const event of userAlertEvents) {
  (patternFormRenderer as Record<string, unknown>)[
    smsPatternNameForEvent(event)
  ] = {
    title: withVariables(
      `پترن پیامک - ${userAlertEventLabels[event]}`,
      userAlertEventVariables[event],
    ),
    type: "text",
  };
}

for (const event of reservationSmsEvents) {
  (patternFormRenderer as Record<string, unknown>)[
    smsPatternNameForEvent(event)
  ] = {
    title: withVariables(
      `پترن پیامک - ${reservationSmsEventLabels[event]}`,
      reservationSmsEventVariables[event],
    ),
    type: "text",
  };
}

for (const event of orderSmsEvents) {
  (patternFormRenderer as Record<string, unknown>)[
    smsPatternNameForEvent(event)
  ] = {
    title: withVariables(
      `پترن پیامک - ${orderSmsEventLabels[event]}`,
      orderSmsEventVariables[event],
    ),
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
