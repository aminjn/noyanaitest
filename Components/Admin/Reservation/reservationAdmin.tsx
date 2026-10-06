"use client";
import { tehranNoon, tehranYmd } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import DateInput from "@/Components/UI/DateInput";
import AreaInput from "@/Components/UI/AreaInput";
import CreateForm from "../UI/CreateForm";
import { adminDateTimeFormat, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./reservationAdmin.module.css";

// Shared bits of the reservations back office (2026-10): labels, the status
// badge and the four one-way actions (cancel + refund, further refund,
// settle a no-show / error, move to another free slot). Every money action
// sends a one-time key made when its popup opens, so a double click or a
// retry can never refund twice (the server rejects a reused key).

export type ReservationStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled"
  | "noShow"
  | "error";

export type SessionType =
  | "inPerson"
  | "sipCall"
  | "textChat"
  | "videoCall"
  | "voiceCall"
  | "phone";

export type AdminPerson = { _id: string; phone?: string; username?: string };
export type AdminDoctor = {
  _id: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  user?: AdminPerson | string | null;
};
export type AdminIdentity = {
  _id: string;
  givenName?: string;
  lastName?: string;
  nationalId?: string;
};
export type AdminOffice = {
  _id: string;
  name?: string;
  address?: string;
  clinic?: { _id: string; name?: string } | string | null;
  hospital?: { _id: string; name?: string } | string | null;
};

export interface IAdminReservationRow {
  _id: string;
  date: string;
  start: number;
  end: number;
  sessionType: SessionType;
  status: ReservationStatus;
  noShowParty?: "patient" | "doctor";
  total?: number;
  doctor: AdminDoctor | null;
  patient: AdminIdentity | null;
  user: AdminPerson | null;
  office: AdminOffice | null;
  createdAt?: string;
}

export const reservationStatusDict: Record<ReservationStatus, string> = {
  get pending() {
    return ta("در انتظار برگزاری");
  },
  get active() {
    return ta("در حال برگزاری");
  },
  get completed() {
    return ta("انجام‌شده");
  },
  get cancelled() {
    return ta("لغو شده");
  },
  get noShow() {
    return ta("غیبت");
  },
  get error() {
    return ta("خطا");
  },
};

export const sessionTypeDict: Record<SessionType, string> = {
  get inPerson() {
    return ta("حضوری");
  },
  get sipCall() {
    return ta("تماس تلفنی (سیپ)");
  },
  get textChat() {
    return ta("گفتگوی متنی");
  },
  get videoCall() {
    return ta("تماس تصویری");
  },
  get voiceCall() {
    return ta("تماس صوتی");
  },
  get phone() {
    return ta("مشاوره تلفنی");
  },
};

export const noShowPartyDict: Record<string, string> = {
  get patient() {
    return ta("بیمار حاضر نشد");
  },
  get doctor() {
    return ta("پزشک حاضر نشد");
  },
};

export const adminActionDict: Record<string, string> = {
  get cancel() {
    return ta("لغو توسط پشتیبانی");
  },
  get refund() {
    return ta("بازپرداخت");
  },
  get reschedule() {
    return ta("جابه‌جایی زمان");
  },
  get resolveRefund() {
    return ta("حل وضعیت: بازگشت وجه");
  },
  get resolveComplete() {
    return ta("حل وضعیت: انجام‌شده");
  },
  get resolveAccept() {
    return ta("حل وضعیت: تأیید نتیجه");
  },
};

export const ReservationStatusBadge = ({
  status,
  noShowParty,
}: {
  status?: string;
  noShowParty?: string;
}) => (
  <span className={`${classes.badge} ${classes[`badge_${status}`] || ""}`}>
    {reservationStatusDict[status as ReservationStatus] || status || "—"}
    {status === "noShow" && noShowParty && noShowPartyDict[noShowParty]
      ? ` · ${noShowPartyDict[noShowParty]}`
      : ""}
  </span>
);

// minutes from midnight -> "HH:MM"
export const hhmm = (minutes?: number) =>
  typeof minutes === "number" && Number.isFinite(minutes)
    ? `${`${Math.floor(minutes / 60)}`.padStart(2, "0")}:${`${minutes % 60}`.padStart(2, "0")}`
    : "—";

const dayFormat = adminDateTimeFormat({
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});
export const formatDay = (value?: string | Date | null) => {
  const date = value ? new Date(value) : null;
  return date && !isNaN(date.getTime()) ? dayFormat.format(date) : "—";
};
export const dateTimeFormat = adminDateTimeFormat({
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export const formatDateTime = (value?: string | Date | null) => {
  const date = value ? new Date(value) : null;
  return date && !isNaN(date.getTime()) ? dateTimeFormat.format(date) : "—";
};

export const doctorLabel = (d?: AdminDoctor | null) =>
  (d && [d.firstName, d.lastName].filter(Boolean).join(" ")) || ta("بدون نام");
export const identityLabel = (p?: AdminIdentity | null) =>
  (p && [p.givenName, p.lastName].filter(Boolean).join(" ")) || ta("بدون نام");
export const personLabel = (u?: AdminPerson | null) => {
  if (!u) return "—";
  const phone = u.phone?.startsWith("98") ? `0${u.phone.slice(2)}` : u.phone;
  return u.username || phone || u._id;
};

// "YYYY-MM-DD" of the Tehran day of a date (a picked day is its Tehran noon)
export const dayKey = (date: Date) => tehranYmd(date);

export const newRequestKey = () => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto)
      return crypto.randomUUID();
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const useRequestKey = () => useState(newRequestKey)[0];

// ---------------------------------------------------------------- cancel

export const CancelReservationPopup = ({
  id,
  refundable,
  onDone,
}: {
  id: string;
  refundable: number;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const requestKey = useRequestKey();
  return (
    <PopupCard title={ta("لغو نوبت")}>
      <p className={classes.hint}>
        {ta("نوبت لغو می‌شود، زمان آن دوباره قابل رزرو است و به بیمار و پزشک اطلاع داده می‌شود. مبلغ قابل بازپرداخت: ${1} تومان", [currencize(refundable)])}
      </p>
      <CreateForm<{ refund: string; amount: number; reason: string }>
        onCancel={() => closePopup()}
        defaultValue={
          { refund: refundable > 0 ? "full" : "none" } as {
            refund: string;
            amount: number;
            reason: string;
          }
        }
        hookProps={{
          path: `${API}/admin/reservations/${id}/cancel`,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) =>
            !inp.reason || String(inp.reason).trim().length < 3
              ? ta("دلیل را بنویسید")
              : inp.refund === "partial" &&
                  (!(Number(inp.amount) > 0) || Number(inp.amount) > refundable)
                ? ta("مبلغ بازپرداخت باید بیشتر از صفر و حداکثر ${1} تومان باشد", [currencize(refundable)])
                : undefined,
          mutator: (inp) => ({
            refund: inp.refund || (refundable > 0 ? "full" : "none"),
            ...(inp.refund === "partial" ? { amount: Number(inp.amount) } : {}),
            reason: inp.reason,
            requestKey,
          }),
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          refund: {
            type: "select",
            title: ta("بازپرداخت به کیف پول بیمار"),
            required: true,
            options: {
              full: ta("کامل"),
              partial: ta("بخشی از مبلغ"),
              none: ta("بدون بازپرداخت"),
            },
          },
          amount: { type: "number", price: true, title: ta("مبلغ بازپرداخت (فقط برای بخشی)") },
          reason: { type: "area", title: ta("دلیل لغو (به بیمار نشان داده نمی‌شود)"), required: true },
        }}
      />
    </PopupCard>
  );
};

// ---------------------------------------------------------------- refund

export const RefundReservationPopup = ({
  id,
  refundable,
  onDone,
}: {
  id: string;
  refundable: number;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const requestKey = useRequestKey();
  return (
    <PopupCard title={ta("بازپرداخت به بیمار")}>
      <p className={classes.hint}>
        {ta("مبلغ به کیف پول کسی که نوبت را رزرو کرده برمی‌گردد. حداکثر: ${1} تومان", [currencize(refundable)])}
      </p>
      <CreateForm<{ amount: number; reason: string }>
        onCancel={() => closePopup()}
        defaultValue={{ amount: refundable } as { amount: number; reason: string }}
        hookProps={{
          path: `${API}/admin/reservations/${id}/refund`,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) =>
            !inp.reason || String(inp.reason).trim().length < 3
              ? ta("دلیل را بنویسید")
              : !(Number(inp.amount ?? refundable) > 0) ||
                  Number(inp.amount ?? refundable) > refundable
                ? ta("مبلغ بازپرداخت باید بیشتر از صفر و حداکثر ${1} تومان باشد", [currencize(refundable)])
                : undefined,
          mutator: (inp) => ({
            amount: Number(inp.amount ?? refundable),
            reason: inp.reason,
            requestKey,
          }),
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          amount: { type: "number", price: true, title: ta("مبلغ (تومان)"), required: true },
          reason: { type: "area", title: ta("دلیل"), required: true },
        }}
      />
    </PopupCard>
  );
};

// ---------------------------------------------------------------- resolve

export const ResolveReservationPopup = ({
  id,
  status,
  noShowParty,
  refundable,
  doctorPaid,
  paid,
  refunded,
  dispute,
  onDone,
}: {
  id: string;
  status: ReservationStatus;
  noShowParty?: string;
  // the patient's objection to an auto-completed in-person visit
  dispute?: { at?: string; reason?: string } | null;
  refundable: number;
  doctorPaid: number;
  // what the booker paid and what already came back to them
  paid?: number;
  refunded?: number;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const requestKey = useRequestKey();
  // Only the outcomes the server can carry out (adminReservationController
  // resolve): "refund" needs money left to return or a payout to take back;
  // "complete" needs a payment nothing was refunded from. An "error" or a
  // doctor no-show was already refunded by the sweep, so there only
  // "accept" is left - offering the other two just ended in an error.
  const canRefund = refundable > 0 || doctorPaid > 0;
  const canComplete = (paid ?? 1) > 0 && (refunded ?? 0) <= 0;
  const options: Record<string, string> = {
    ...(canRefund ? { refund: ta("بازگشت وجه به بیمار") } : {}),
    ...(canComplete ? { complete: ta("انجام‌شده (تسویه با پزشک)") } : {}),
    // an objection is upheld or rejected, never just "accepted"
    ...(dispute ? {} : { accept: ta("تأیید نتیجه‌ی خودکار") }),
  };
  return (
    <PopupCard title={ta("حل وضعیت نوبت")}>
      <div className={classes.hint}>
        <p>
          {dispute
            ? ta("این ویزیت حضوری بدون ثبت حضور انجام‌شده ثبت شد و بیمار اعتراض کرده که ویزیت نشده است. مبلغ پزشک هنوز در دوره‌ی تسویه است. دلیل بیمار: ${1}", [dispute.reason || "—"])
            : status === "noShow"
            ? noShowParty === "patient"
              ? ta("سیستم ثبت کرده که بیمار حاضر نشده و مبلغ نوبت به پزشک تسویه شده است.")
              : ta("سیستم ثبت کرده که پزشک حاضر نشده و مبلغ به بیمار برگشت داده شده است.")
            : ta("سیستم نتوانست نتیجه‌ی این نوبت را مشخص کند (کانال باز نشد یا هیچ‌کدام حاضر نشدند).")}
        </p>
        <ul className={classes.list}>
          {canRefund && (
            <li>{ta("بازگشت وجه: باقی‌مانده‌ی مبلغ (${1} تومان) به بیمار برمی‌گردد و اگر به پزشک تسویه شده (${2} تومان) از کیف پول او برگشت می‌خورد.", [currencize(refundable), currencize(doctorPaid)])}</li>
          )}
          {canComplete && (
            <li>{ta("انجام‌شده: ویزیت برگزار شده؛ وضعیت «انجام‌شده» می‌شود و مبلغ به پزشک تسویه می‌شود (فقط اگر چیزی به بیمار برنگشته باشد).")}</li>
          )}
          {!dispute && (
            <li>{ta("تأیید نتیجه: نتیجه‌ی خودکار درست است؛ فقط بررسی‌شده علامت می‌خورد.")}</li>
          )}
        </ul>
      </div>
      <CreateForm<{ action: string; reason: string }>
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/admin/reservations/${id}/resolve`,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) =>
            !inp.action
              ? ta("یک راه‌حل انتخاب کنید")
              : !inp.reason || String(inp.reason).trim().length < 3
                ? ta("دلیل را بنویسید")
                : undefined,
          mutator: (inp) => ({ action: inp.action, reason: inp.reason, requestKey }),
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          action: {
            type: "select",
            title: ta("راه‌حل"),
            required: true,
            options,
          },
          reason: { type: "area", title: ta("توضیح بررسی"), required: true },
        }}
      />
    </PopupCard>
  );
};

// ---------------------------------------------------------------- reschedule

type Slot = {
  start: number;
  end: number;
  office: { _id: string; name?: string } | null;
  taken: boolean;
  past: boolean;
};

export const RescheduleReservationPopup = ({
  id,
  currentDate,
  onDone,
}: {
  id: string;
  currentDate?: string;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  // the visit's Tehran day, as the picker's own (local) date
  const [day, setDay] = useState<Date | undefined>(() => {
    const ymd = currentDate ? tehranYmd(currentDate) : "";
    return ymd ? tehranNoon(ymd) : undefined;
  });
  const [picked, setPicked] = useState<Slot | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useMemo(() => (day ? dayKey(day) : null), [day]);
  const { data: slots, error, isLoading } = useSWR<Slot[]>(
    key ? `${API}/admin/reservations/${id}/slots?date=${key}` : null,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res?.data?.data) ? res.data.data : [])),
  );

  const submit = async () => {
    if (!key || !picked) return;
    if (reason.trim().length < 3) {
      pushNotification(ta("دلیل را بنویسید"), "Error");
      return;
    }
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/reservations/${id}/reschedule`,
        method: "POST",
        bodyParser: "JSON",
        payload: { date: key, start: picked.start, end: picked.end, reason: reason.trim() },
      });
      pushNotification(ta("زمان نوبت تغییر کرد"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || ta("خطایی رخ داد"), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={ta("جابه‌جایی زمان نوبت")}>
      <div className={classes.body}>
        <p className={classes.hint}>
          {ta("فقط جلسه‌های آزاد همین پزشک با همین نوع ویزیت نشان داده می‌شود. مبلغ پرداخت‌شده تغییر نمی‌کند و به بیمار و پزشک اطلاع داده می‌شود.")}
        </p>
        <DateInput
          title={ta("روز جدید")}
          placeholder
          defaultValue={day}
          onChange={(d) => {
            setDay(d);
            setPicked(null);
          }}
        />
        {key &&
          (error ? (
            <p className={classes.error}>{(error as Error)?.message || ta("خطایی رخ داد")}</p>
          ) : isLoading || !slots ? (
            <p className={classes.hint}>{ta("در حال بارگذاری…")}</p>
          ) : !slots.length ? (
            <p className={classes.hint}>{ta("پزشک در این روز شیفتی برای این نوع ویزیت ندارد.")}</p>
          ) : (
            <div className={classes.slots} role="listbox" aria-label={ta("جلسه‌ها")}>
              {slots.map((slot) => {
                const disabled = slot.taken || slot.past;
                const active = picked?.start === slot.start && picked?.end === slot.end;
                return (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={disabled}
                    className={`${classes.slot} ${active ? classes.slotActive : ""}`}
                    title={slot.taken ? ta("رزرو شده") : slot.past ? ta("گذشته") : slot.office?.name || ""}
                    onClick={() => setPicked(slot)}
                  >
                    {hhmm(slot.start)}–{hhmm(slot.end)}
                  </button>
                );
              })}
            </div>
          ))}
        <AreaInput
          title={ta("دلیل جابه‌جایی")}
          required
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
        />
        <div className={classes.actions}>
          <Button
            onClick={picked ? submit : undefined}
            variant={picked ? "Primary" : "Disable"}
            isLoading={busy}
          >
            {ta("انتقال به این زمان")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};
