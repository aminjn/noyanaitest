import { ta } from "@/Components/Admin/i18n/adminText";
import {
  userAlertEvents,
  userAlertEventLabels,
  UserAlertEvent,
} from "../UserAlert/AdminManageUserAlertsPage";

// Every SMS pattern the backend can send (backend Models/SmsPatterns.ts),
// with what the admin needs to create it on IPPanel: a title, the exact
// variable names the backend fills in, a sample text to copy, and who
// receives it (the page groups patterns by audience). Front and back are
// separate packages, so the event lists below are kept in sync by hand with
// backend Models/UserAlert.ts (userAlertEvents), Models/Reservation.ts
// (reservationSmsEvents), Models/Order.ts (orderSmsEvents) and
// Models/NotificationSms.ts (notificationSmsEvents). Adding an event there
// and here (label, variables, sample, audience) is all a new pattern needs.
//
// Samples use IPPanel's %name% placeholder syntax. They are written in the
// panel's language (ta), which is also the base pattern's language.

export const reservationSmsEvents = [
  "newReservationDoctor",
  "newReservationPatient",
  // sent instead of newReservationPatient when someone else booked for the
  // patient (backend Services/reservationSmsService.ts isBookedForRelative)
  "newReservationRelativePatient",
  "upcomingReservationDoctor",
  "upcomingReservationPatient",
  "reservationInProgressDoctorNoShow",
  "reservationInProgressPatientNoShow",
  "visitConfirmPatient",
] as const;
export type ReservationSmsEvent = (typeof reservationSmsEvents)[number];

export const orderSmsEvents = [
  "newOrderUser",
  "newOrderPharmacy",
  "newOrderDoctor",
  "newOrderParaClinic",
] as const;
export type OrderSmsEvent = (typeof orderSmsEvents)[number];

// backend Models/NotificationSms.ts (2026-10): every patient / provider
// event, sent by Services/notificationSmsService.ts notifyWithSms
export const notificationSmsEvents = [
  "reservationCancelledPatient",
  "reservationCancelledDoctor",
  "reservationRescheduledPatient",
  "reservationRescheduledDoctor",
  "reservationRefundedPatient",
  "reservationNoShowPatient",
  "reservationNoShowDoctor",
  "reservationCompletedBySupportDoctor",
  "reservationPayoutReversedDoctor",
  "visitNoteReadyPatient",
  "reservationReminderDayBeforePatient",
  "reservationReminderTwoHoursPatient",
  "orderShippedUser",
  "orderItemFulfilledUser",
  "orderItemCancelledUser",
  "prescriptionRejectedUser",
  "labResultReadyUser",
  "orderCancelledByBuyerSeller",
  "walletChargedUser",
  "gatewayPaymentCreditedUser",
  "gatewayPaymentRefundedUser",
  "walletCreditedUser",
  "walletDebitedUser",
  "withdrawalPaidProvider",
  "withdrawalRejectedProvider",
  "payoutReleasedProvider",
  "providerRequestApprovedProvider",
  "providerRequestRejectedProvider",
  "centreMembershipApprovedDoctor",
  "centreMembershipRejectedDoctor",
  "centreInvitationDoctor",
  "centreMembershipEndedDoctor",
  "additionRequestDoneDoctor",
  "providerSuspendedProvider",
  "providerReinstatedProvider",
  "providerOwnerAssignedProvider",
  "smsCampaignApprovedProvider",
  "smsCampaignFailedProvider",
  "articleApprovedProvider",
  "articleRejectedProvider",
  "licensePurchasedProvider",
  "licenseExpiringProvider",
  "licenseExpiredProvider",
  "proPurchasedUser",
  "proExpiringUser",
  "proExpiredUser",
  "ticketAnsweredUser",
  "accountSuspendedUser",
  "accountReactivatedUser",
] as const;
export type NotificationSmsEvent = (typeof notificationSmsEvents)[number];

// Type-level camelCase -> snake_case, mirrors backend Lib/smsPatternName.ts
type SnakeCase<S extends string> = S extends `${infer Head}${infer Rest}`
  ? Head extends Uppercase<Head>
    ? `_${Head}${SnakeCase<Rest>}`
    : `${Head}${SnakeCase<Rest>}`
  : S;

export type SmsPatternNameFor<E extends string> =
  `${Uppercase<SnakeCase<E>>}_PATTERN`;

export type SmsPatternName =
  | "OTP_PATTERN"
  | "SECRETARY_INVITE_PATTERN"
  | "INVOICE_LINK_PATTERN"
  | "CRM_DOC_LINK_PATTERN"
  | SmsPatternNameFor<UserAlertEvent>
  | SmsPatternNameFor<ReservationSmsEvent>
  | SmsPatternNameFor<OrderSmsEvent>
  | SmsPatternNameFor<NotificationSmsEvent>;

// "newBecomeDoctorRequest" -> "NEW_BECOME_DOCTOR_REQUEST_PATTERN", mirrors
// backend Lib/smsPatternName.ts smsPatternNameForEvent
export const smsPatternNameForEvent = <E extends string>(
  event: E,
): SmsPatternNameFor<E> =>
  `${event.replace(/([A-Z])/g, "_$1").toUpperCase()}_PATTERN` as SmsPatternNameFor<E>;

export type SmsAudience = "general" | "patient" | "provider" | "staff";

export const smsAudienceOrder: SmsAudience[] = ["patient", "provider", "staff", "general"];

export const smsAudienceLabels: Record<SmsAudience, string> = {
  get general() {
    return ta("عمومی");
  },
  get patient() {
    return ta("بیمار و کاربر");
  },
  get provider() {
    return ta("ارائه‌دهنده (پزشک و مراکز)");
  },
  get staff() {
    return ta("کارکنان");
  },
};

export type SmsPatternEntry = {
  name: SmsPatternName;
  audience: SmsAudience;
  // the event's own label (the field title adds «پترن پیامک - »)
  label: () => string;
  variables: string[];
  sample: () => string;
};

type EventMeta = {
  audience: SmsAudience;
  label: () => string;
  variables: string[];
  sample: () => string;
};

const staffSample = (event: UserAlertEvent): string => {
  const label = userAlertEventLabels[event];
  switch (event) {
    case "newTicket":
      return ta("تیکت جدید «%ticketTitle%» از %userPhone% ثبت شد. شناسه: %ticketId%");
    case "newWithdrawalRequest":
      return ta("درخواست برداشت %amount% تومان از %userPhone% ثبت شد.");
    case "newVisitDispute":
      return ta("بیمار %userPhone% به ویزیت حضوری ثبت‌شده اعتراض کرد. نوبت: %reservationId%");
    case "newSmsCampaign":
      return ta("کمپین پیامکی «%name%» منتظر تأیید است.");
    case "newClinicAdditionRequest":
    case "newPharmacyAdditionRequest":
    case "newHospitalAdditionRequest":
    case "newInsuranceAdditionRequest":
      return ta("«${1}» برای «%name%» در صف درخواست‌ها است.", [label]);
    default:
      return ta("«${1}» تازه از %userPhone% در صف درخواست‌ها است.", [label]);
  }
};

// mirrors backend Models/UserAlert.ts UserAlertSmsVariables
const userAlertEventVariables: Record<UserAlertEvent, string[]> = {
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
  newVisitDispute: ["reservationId", "userPhone"],
  newSmsCampaign: ["requestId", "name"],
};

// mirrors backend Models/Reservation.ts ReservationSmsVariables
const reservationMeta: Record<ReservationSmsEvent, EventMeta> = {
  newReservationDoctor: {
    audience: "provider",
    label: () => ta("نوبت جدید - پزشک"),
    variables: ["reservationId", "patientName", "date", "time"],
    sample: () => ta("نوبت جدید: %patientName%، %date% ساعت %time%."),
  },
  newReservationPatient: {
    audience: "patient",
    label: () => ta("نوبت جدید - بیمار"),
    variables: ["reservationId", "doctorName", "date", "time"],
    sample: () => ta("نوبت شما با دکتر %doctorName% برای %date% ساعت %time% ثبت شد."),
  },
  newReservationRelativePatient: {
    audience: "patient",
    label: () => ta("نوبت جدید - بیمار (رزرو توسط دیگری)"),
    variables: ["reservationId", "doctorName", "date", "time", "bookerName"],
    sample: () => ta("%bookerName% برای شما نوبت دکتر %doctorName% در %date% ساعت %time% گرفت."),
  },
  upcomingReservationDoctor: {
    audience: "provider",
    label: () => ta("یادآوری نوبت - پزشک"),
    variables: ["reservationId", "minutesBefore", "date", "time"],
    sample: () => ta("یادآوری: نوبت %date% ساعت %time% تا %minutesBefore% دقیقه‌ی دیگر شروع می‌شود."),
  },
  upcomingReservationPatient: {
    audience: "patient",
    label: () => ta("یادآوری نوبت - بیمار"),
    variables: ["reservationId", "minutesBefore", "date", "time"],
    sample: () => ta("یادآوری: نوبت %date% ساعت %time% تا %minutesBefore% دقیقه‌ی دیگر شروع می‌شود."),
  },
  reservationInProgressDoctorNoShow: {
    audience: "provider",
    label: () => ta("یادآوری حضور در نوبت - پزشک"),
    variables: ["reservationId"],
    sample: () => ta("بیمار منتظر شماست؛ لطفاً همین حالا وارد نوبت شوید."),
  },
  reservationInProgressPatientNoShow: {
    audience: "patient",
    label: () => ta("یادآوری حضور در نوبت - بیمار"),
    variables: ["reservationId"],
    sample: () => ta("پزشک منتظر شماست؛ لطفاً همین حالا وارد نوبت شوید."),
  },
  visitConfirmPatient: {
    audience: "patient",
    label: () => ta("تأیید ویزیت حضوری بدون ثبت حضور - بیمار"),
    variables: ["reservationId", "doctorName", "date"],
    sample: () =>
      ta("ویزیت حضوری شما با دکتر %doctorName% در %date% انجام‌شده ثبت شد. اگر ویزیت نشدید، از صفحه‌ی نوبت اعتراض کنید."),
  },
};

// mirrors backend Models/Order.ts OrderSmsVariables
const orderMeta: Record<OrderSmsEvent, EventMeta> = {
  newOrderUser: {
    audience: "patient",
    label: () => ta("سفارش جدید - خریدار"),
    variables: ["orderId", "total"],
    sample: () => ta("سفارش شما به مبلغ %total% تومان ثبت شد. شماره‌ی سفارش: %orderId%"),
  },
  newOrderPharmacy: {
    audience: "provider",
    label: () => ta("سفارش جدید - داروخانه"),
    variables: ["orderId", "customerName"],
    sample: () => ta("سفارش جدید از %customerName% ثبت شد. شماره‌ی سفارش: %orderId%"),
  },
  newOrderDoctor: {
    audience: "provider",
    label: () => ta("سفارش جدید - پزشک"),
    variables: ["orderId", "customerName"],
    sample: () => ta("سفارش جدید از %customerName% ثبت شد. شماره‌ی سفارش: %orderId%"),
  },
  newOrderParaClinic: {
    audience: "provider",
    label: () => ta("سفارش جدید - پاراکلینیک"),
    variables: ["orderId", "customerName"],
    sample: () => ta("سفارش جدید از %customerName% ثبت شد. شماره‌ی سفارش: %orderId%"),
  },
};

// mirrors backend Models/NotificationSms.ts NotificationSmsVariables
const notificationMeta: Record<NotificationSmsEvent, EventMeta> = {
  reservationCancelledPatient: {
    audience: "patient",
    label: () => ta("لغو نوبت - بیمار"),
    variables: ["reservationId", "doctorName", "date", "time", "amount"],
    sample: () =>
      ta("نوبت شما با دکتر %doctorName% در %date% ساعت %time% لغو شد و %amount% تومان به کیف پول شما برگشت."),
  },
  reservationCancelledDoctor: {
    audience: "provider",
    label: () => ta("لغو نوبت - پزشک"),
    variables: ["reservationId", "patientName", "date", "time"],
    sample: () => ta("نوبت %patientName% در %date% ساعت %time% لغو شد و زمان آن دوباره قابل رزرو است."),
  },
  reservationRescheduledPatient: {
    audience: "patient",
    label: () => ta("تغییر زمان نوبت - بیمار"),
    variables: ["reservationId", "doctorName", "date", "time"],
    sample: () => ta("زمان نوبت شما با دکتر %doctorName% به %date% ساعت %time% تغییر کرد."),
  },
  reservationRescheduledDoctor: {
    audience: "provider",
    label: () => ta("تغییر زمان نوبت - پزشک"),
    variables: ["reservationId", "patientName", "date", "time"],
    sample: () => ta("نوبت %patientName% به %date% ساعت %time% منتقل شد."),
  },
  reservationRefundedPatient: {
    audience: "patient",
    label: () => ta("بازپرداخت نوبت - بیمار"),
    variables: ["reservationId", "amount"],
    sample: () => ta("%amount% تومان بابت نوبت شما به کیف پولتان برگشت."),
  },
  reservationNoShowPatient: {
    audience: "patient",
    label: () => ta("غیبت بیمار در نوبت - بیمار"),
    variables: ["reservationId", "doctorName", "date"],
    sample: () => ta("شما در نوبت دکتر %doctorName% در %date% حاضر نشدید و هزینه‌ی آن برگشت داده نمی‌شود."),
  },
  reservationNoShowDoctor: {
    audience: "provider",
    label: () => ta("غیبت پزشک در نوبت - پزشک"),
    variables: ["reservationId", "date"],
    sample: () => ta("شما در نوبت %date% حاضر نشدید و مبلغ آن به بیمار برگشت داده شد."),
  },
  reservationCompletedBySupportDoctor: {
    audience: "provider",
    label: () => ta("ثبت انجام نوبت توسط پشتیبانی - پزشک"),
    variables: ["reservationId"],
    sample: () => ta("پس از بررسی پشتیبانی، نوبت %reservationId% انجام‌شده ثبت و مبلغ آن به کیف پول شما واریز شد."),
  },
  reservationPayoutReversedDoctor: {
    audience: "provider",
    label: () => ta("برگشت تسویه‌ی نوبت - پزشک"),
    variables: ["reservationId", "amount"],
    sample: () => ta("پس از بررسی پشتیبانی، %amount% تومان تسویه‌ی یک نوبت از کیف پول شما برگشت خورد."),
  },
  visitNoteReadyPatient: {
    audience: "patient",
    label: () => ta("توصیه‌های پس از ویزیت - بیمار"),
    variables: ["reservationId", "doctorName"],
    sample: () => ta("دکتر %doctorName% توصیه‌های پس از ویزیت شما را ثبت کرد. آن‌ها را در صفحه‌ی نوبت ببینید."),
  },
  // 24 hours / 2 hours before the visit (2026-10), each switchable in the
  // booking settings
  reservationReminderDayBeforePatient: {
    audience: "patient",
    label: () => ta("یادآوری ۲۴ ساعت پیش از نوبت - بیمار"),
    variables: ["reservationId", "doctorName", "date", "time"],
    sample: () => ta("یادآوری: نوبت شما با دکتر %doctorName% در تاریخ %date% ساعت %time% است."),
  },
  reservationReminderTwoHoursPatient: {
    audience: "patient",
    label: () => ta("یادآوری ۲ ساعت پیش از نوبت - بیمار"),
    variables: ["reservationId", "doctorName", "date", "time"],
    sample: () => ta("یادآوری: نوبت شما با دکتر %doctorName% ساعت %time% آغاز می‌شود."),
  },
  orderShippedUser: {
    audience: "patient",
    label: () => ta("ارسال سفارش - خریدار"),
    variables: ["orderId", "sellerName", "trackingCode"],
    sample: () => ta("سفارش %orderId% از %sellerName% ارسال شد. کد رهگیری: %trackingCode%"),
  },
  orderItemFulfilledUser: {
    audience: "patient",
    label: () => ta("آماده شدن سفارش - خریدار"),
    variables: ["orderId"],
    sample: () => ta("بخشی از سفارش %orderId% شما آماده و تحویل شد."),
  },
  orderItemCancelledUser: {
    audience: "patient",
    label: () => ta("لغو قلم سفارش - خریدار"),
    variables: ["orderId"],
    sample: () => ta("بخشی از سفارش %orderId% لغو شد و مبلغ آن به کیف پول شما برگشت."),
  },
  prescriptionRejectedUser: {
    audience: "patient",
    label: () => ta("رد نسخه توسط داروخانه - خریدار"),
    variables: ["orderId", "pharmacyName", "reason"],
    sample: () => ta("داروخانه‌ی %pharmacyName% نسخه‌ی سفارش %orderId% را نپذیرفت (%reason%). مبلغ آن قلم به کیف پول شما برگشت."),
  },
  labResultReadyUser: {
    audience: "patient",
    label: () => ta("آماده شدن جواب آزمایش - خریدار"),
    variables: ["orderId", "labName"],
    sample: () => ta("جواب آزمایش شما در %labName% آماده است. سفارش: %orderId%"),
  },
  orderCancelledByBuyerSeller: {
    audience: "provider",
    label: () => ta("لغو سفارش توسط خریدار - فروشنده"),
    variables: ["orderId"],
    sample: () => ta("خریدار بخشی از سفارش %orderId% را لغو کرد؛ آن را ارسال نکنید."),
  },
  walletChargedUser: {
    audience: "patient",
    label: () => ta("شارژ کیف پول - کاربر"),
    variables: ["amount"],
    sample: () => ta("کیف پول شما %amount% تومان شارژ شد."),
  },
  gatewayPaymentCreditedUser: {
    audience: "patient",
    label: () => ta("واریز پرداخت بررسی‌شده به کیف پول - کاربر"),
    variables: ["amount"],
    sample: () => ta("پس از بررسی پشتیبانی، %amount% تومان پرداخت شما به کیف پولتان واریز شد."),
  },
  gatewayPaymentRefundedUser: {
    audience: "patient",
    label: () => ta("برگشت پرداخت به کارت - کاربر"),
    variables: ["amount"],
    sample: () => ta("پس از بررسی پشتیبانی، %amount% تومان پرداخت شما به کارت بانکی‌تان برگشت داده شد."),
  },
  walletCreditedUser: {
    audience: "patient",
    label: () => ta("افزایش کیف پول توسط پشتیبانی - کاربر"),
    variables: ["amount", "reason"],
    sample: () => ta("پشتیبانی %amount% تومان به کیف پول شما افزود. توضیح: %reason%"),
  },
  walletDebitedUser: {
    audience: "patient",
    label: () => ta("کسر از کیف پول توسط پشتیبانی - کاربر"),
    variables: ["amount", "reason"],
    sample: () => ta("پشتیبانی %amount% تومان از کیف پول شما کسر کرد. توضیح: %reason%"),
  },
  withdrawalPaidProvider: {
    audience: "provider",
    label: () => ta("واریز برداشت - ارائه‌دهنده"),
    variables: ["amount", "trackingCode"],
    sample: () => ta("%amount% تومان به حساب شما واریز شد. کد پیگیری: %trackingCode%"),
  },
  withdrawalRejectedProvider: {
    audience: "provider",
    label: () => ta("رد برداشت - ارائه‌دهنده"),
    variables: ["amount", "reason"],
    sample: () => ta("درخواست برداشت %amount% تومان رد شد و مبلغ به کیف پول شما برگشت. دلیل: %reason%"),
  },
  payoutReleasedProvider: {
    audience: "provider",
    label: () => ta("آزاد شدن درآمد - ارائه‌دهنده"),
    variables: ["amount"],
    sample: () => ta("%amount% تومان از درآمد شما قابل برداشت شد."),
  },
  providerRequestApprovedProvider: {
    audience: "provider",
    label: () => ta("تأیید درخواست همکاری - ارائه‌دهنده"),
    variables: ["kind"],
    sample: () => ta("درخواست همکاری شما به‌عنوان %kind% تأیید شد و پنل شما فعال است."),
  },
  providerRequestRejectedProvider: {
    audience: "provider",
    label: () => ta("رد درخواست - ارائه‌دهنده"),
    variables: ["title", "reason"],
    sample: () => ta("درخواست «%title%» رد شد. دلیل: %reason%"),
  },
  centreMembershipApprovedDoctor: {
    audience: "provider",
    label: () => ta("تأیید عضویت در مرکز - پزشک"),
    variables: ["centre"],
    sample: () => ta("عضویت شما در %centre% تأیید شد."),
  },
  centreMembershipRejectedDoctor: {
    audience: "provider",
    label: () => ta("رد عضویت در مرکز - پزشک"),
    variables: ["centre", "reason"],
    sample: () => ta("درخواست عضویت شما در %centre% رد شد. %reason%"),
  },
  centreInvitationDoctor: {
    audience: "provider",
    label: () => ta("دعوت مرکز به همکاری - پزشک"),
    variables: ["centre"],
    sample: () => ta("%centre% شما را به همکاری دعوت کرد. برای پاسخ وارد پنل پزشک شوید."),
  },
  centreMembershipEndedDoctor: {
    audience: "provider",
    label: () => ta("پایان عضویت در مرکز - پزشک"),
    variables: ["centre"],
    sample: () => ta("عضویت شما در %centre% پایان یافت."),
  },
  additionRequestDoneDoctor: {
    audience: "provider",
    label: () => ta("افزوده شدن مرکز درخواستی - پزشک"),
    variables: ["centre"],
    sample: () => ta("%centre% به نویان اضافه شد و شما به‌عنوان پزشک آن ثبت شدید."),
  },
  providerSuspendedProvider: {
    audience: "provider",
    label: () => ta("تعلیق صفحه - ارائه‌دهنده"),
    variables: ["kind", "name", "reason"],
    sample: () => ta("%kind% «%name%» تعلیق شد و نوبت یا سفارش تازه نمی‌گیرد. دلیل: %reason%"),
  },
  providerReinstatedProvider: {
    audience: "provider",
    label: () => ta("رفع تعلیق صفحه - ارائه‌دهنده"),
    variables: ["kind", "name"],
    sample: () => ta("تعلیق %kind% «%name%» برداشته شد."),
  },
  providerOwnerAssignedProvider: {
    audience: "provider",
    label: () => ta("سپردن پنل به حساب - ارائه‌دهنده"),
    variables: ["kind", "name"],
    sample: () => ta("مدیریت %kind% «%name%» در نویان به حساب شما سپرده شد."),
  },
  smsCampaignApprovedProvider: {
    audience: "provider",
    label: () => ta("تأیید کمپین پیامکی - ارائه‌دهنده"),
    variables: ["name"],
    sample: () => ta("کمپین «%name%» تأیید شد و در ساعت مجاز ارسال می‌شود."),
  },
  smsCampaignFailedProvider: {
    audience: "provider",
    label: () => ta("ارسال نشدن کمپین پیامکی - ارائه‌دهنده"),
    variables: ["name", "reason"],
    sample: () => ta("کمپین «%name%» ارسال نشد. دلیل: %reason%"),
  },
  articleApprovedProvider: {
    audience: "provider",
    label: () => ta("انتشار مقاله - ارائه‌دهنده"),
    variables: ["title"],
    sample: () => ta("مقاله‌ی «%title%» تأیید و منتشر شد."),
  },
  articleRejectedProvider: {
    audience: "provider",
    label: () => ta("رد مقاله - ارائه‌دهنده"),
    variables: ["title", "reason"],
    sample: () => ta("مقاله‌ی «%title%» تأیید نشد. دلیل: %reason%"),
  },
  licensePurchasedProvider: {
    audience: "provider",
    label: () => ta("خرید اشتراک - ارائه‌دهنده"),
    variables: ["plan", "expiresAt"],
    sample: () => ta("اشتراک «%plan%» شما تا %expiresAt% فعال شد."),
  },
  licenseExpiringProvider: {
    audience: "provider",
    label: () => ta("نزدیک شدن پایان اشتراک - ارائه‌دهنده"),
    variables: ["plan", "days", "expiresAt"],
    sample: () => ta("اشتراک «%plan%» %days% روز دیگر (%expiresAt%) تمام می‌شود. برای ادامه آن را تمدید کنید."),
  },
  licenseExpiredProvider: {
    audience: "provider",
    label: () => ta("پایان اشتراک - ارائه‌دهنده"),
    variables: ["plan"],
    sample: () => ta("اشتراک «%plan%» به پایان رسید. برای ادامه‌ی دسترسی اشتراک تازه بخرید."),
  },
  // the patients' «پرو» membership (2026-10, backend Lib/patientPro.ts,
  // Services/patientProService.ts)
  proPurchasedUser: {
    audience: "patient",
    label: () => ta("خرید اشتراک پرو - کاربر"),
    variables: ["plan", "expiresAt"],
    sample: () => ta("اشتراک «%plan%» شما تا %expiresAt% فعال شد."),
  },
  proExpiringUser: {
    audience: "patient",
    label: () => ta("نزدیک شدن پایان اشتراک پرو - کاربر"),
    variables: ["plan", "days", "expiresAt"],
    sample: () => ta("اشتراک «%plan%» %days% روز دیگر (%expiresAt%) تمام می‌شود. برای ادامه‌ی مزایا آن را تمدید کنید."),
  },
  proExpiredUser: {
    audience: "patient",
    label: () => ta("پایان اشتراک پرو - کاربر"),
    variables: ["plan"],
    sample: () => ta("اشتراک «%plan%» به پایان رسید. برای استفاده‌ی دوباره از مزایا آن را تمدید کنید."),
  },
  ticketAnsweredUser: {
    audience: "patient",
    label: () => ta("پاسخ تیکت - کاربر"),
    variables: ["ticketId", "ticketTitle"],
    sample: () => ta("پشتیبانی به تیکت «%ticketTitle%» پاسخ داد."),
  },
  accountSuspendedUser: {
    audience: "patient",
    label: () => ta("تعلیق حساب - کاربر"),
    variables: ["reason", "until"],
    sample: () => ta("حساب شما در نویان تعلیق شد. دلیل: %reason%"),
  },
  accountReactivatedUser: {
    audience: "patient",
    label: () => ta("فعال شدن دوباره‌ی حساب - کاربر"),
    variables: [],
    sample: () => ta("حساب شما در نویان دوباره فعال شد."),
  },
};

const entry = (name: SmsPatternName, meta: EventMeta): SmsPatternEntry => ({
  name,
  ...meta,
});

// every pattern, in the order the page lists them inside each audience
export const smsPatternCatalog: SmsPatternEntry[] = [
  entry("OTP_PATTERN", {
    audience: "general",
    label: () => ta("کد تأیید ورود (OTP)"),
    variables: ["OTP"],
    sample: () => ta("کد تأیید شما در نویان: %OTP%"),
  }),
  entry("SECRETARY_INVITE_PATTERN", {
    audience: "provider",
    label: () => ta("دعوت منشی"),
    variables: ["owner"],
    sample: () =>
      ta("%owner% شما را به همکاری به‌عنوان منشی در نویان دعوت کرده است. برای پذیرش وارد پنل منشی شوید."),
  }),
  // a provider's invoice link to its patient (2026-10, «مالی و حسابداری»
  // → صورتحساب‌ها; backend Lib/business/invoices.ts smsInvoice)
  entry("INVOICE_LINK_PATTERN", {
    audience: "patient",
    label: () => ta("لینک صورتحساب بیمار"),
    variables: ["center", "amount", "link"],
    sample: () => ta("صورتحساب %center% به مبلغ %amount% تومان: %link%"),
  }),
  // a treatment plan or contract link to its patient or party («ارتباط با
  // بیماران» → فروش؛ backend Lib/business/crmSales.ts smsLink)
  entry("CRM_DOC_LINK_PATTERN", {
    audience: "patient",
    label: () => ta("لینک طرح درمان یا قرارداد"),
    variables: ["center", "title", "link"],
    sample: () => ta("%center%: %title% را از این لینک ببینید و تأیید کنید: %link%"),
  }),
  ...reservationSmsEvents.map((event) =>
    entry(smsPatternNameForEvent(event), reservationMeta[event]),
  ),
  ...orderSmsEvents.map((event) => entry(smsPatternNameForEvent(event), orderMeta[event])),
  ...notificationSmsEvents.map((event) =>
    entry(smsPatternNameForEvent(event), notificationMeta[event]),
  ),
  ...userAlertEvents.map((event) =>
    entry(smsPatternNameForEvent(event), {
      audience: "staff",
      label: () => userAlertEventLabels[event],
      variables: userAlertEventVariables[event],
      sample: () => staffSample(event),
    }),
  ),
];
