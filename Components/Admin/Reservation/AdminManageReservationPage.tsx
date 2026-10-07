"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { currencize } from "@/Components/helpers/currencize";
import usePopup from "@/Components/Hooks/usePopup";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import {
  AdminDoctor,
  AdminIdentity,
  AdminOffice,
  AdminPerson,
  CancelReservationPopup,
  RefundReservationPopup,
  RescheduleReservationPopup,
  ReservationStatus,
  ReservationStatusBadge,
  ResolveReservationPopup,
  SessionType,
  adminActionDict,
  doctorLabel,
  formatDateTime,
  formatDay,
  hhmm,
  identityLabel,
  personLabel,
  sessionTypeDict,
} from "./reservationAdmin";
import InsuranceBreakdown, { BreakdownReservation, BreakdownTexts, hasInsuranceBreakdown } from "@/Components/Booking/Insurance/InsuranceBreakdown";
import classes from "./AdminManageReservationPage.module.css";

// the insurance split's texts in the admin panel (Persian ta())
const breakdownTexts = (): BreakdownTexts => ({
  title: ta("سهم بیمه و سهم بیمار"),
  price: ta("مبلغ ویزیت"),
  basic: ta("بیمه‌ی پایه"),
  supplementary: ta("بیمه‌ی تکمیلی"),
  patientShare: ta("سهم بیمار"),
  paidOnline: ta("پرداخت آنلاین"),
  paidDesk: ta("پرداخت در مطب"),
  deskPaid: ta("پرداخت در مطب دریافت شد"),
  status: {
    pending: ta("در انتظار ویزیت"),
    booked: ta("ثبت در مطالبات"),
    cancelled: ta("لغو شد"),
    reversed: ta("برگشت خورد"),
    desk: ta("برآورد (پرداخت در مطب)"),
    none: ta("بدون سهم"),
  },
  reason: (r: string) =>
    r === "limit" ? ta("سقف بیمه پر شده") : r === "notEligible" ? ta("اعتبار بیمه تأیید نشد") : ta("تعرفه‌ای ثبت نشده"),
  viaCentre: (name: string) => ta("قرارداد با ${1}", [name]),
  verified: ta("اعتبار بیمه تأیید شد"),
  onClaim: ta("در لیست بیمه"),
  estimate: ta("سهم بیمه برآورد است و تأیید نهایی با بیمه است."),
});

// One reservation (2026-10): who, when, where, the money trail (what the
// booker paid, refunds, the doctor's payout), the call / chat it ran on, the
// patient's review and what support did to it. The one-way actions sit in
// the header (cancel is the red one) and only show when the state allows
// them - the server checks the same rules again.

type Transaction = {
  _id: string;
  amount: number;
  createdAt?: string;
  user?: AdminPerson | null;
  doctor?: string;
  adminAction?: string;
  adminBy?: AdminPerson | null;
  note?: string;
  commission?: number;
};

type AdminAction = {
  action: string;
  by?: AdminPerson | null;
  at?: string;
  reason?: string;
  amount?: number;
  reversedPayout?: number;
  fromDate?: string;
  fromStart?: number;
};

type CallSummary = {
  _id: string;
  callType?: string;
  status?: string;
  startedAt?: string;
  connectedAt?: string;
  endedAt?: string;
  recordings?: number;
};

export interface IAdminReservation {
  _id: string;
  date: string;
  start: number;
  end: number;
  startsAt?: string;
  sessionType: SessionType;
  status: ReservationStatus;
  noShowParty?: "patient" | "doctor";
  autoCompleted?: boolean;
  disputeDeadline?: string;
  dispute?: { at: string; reason: string } | null;
  doctor: (AdminDoctor & { user?: AdminPerson | null }) | null;
  patient: (AdminIdentity & { phones?: string[] }) | null;
  user: AdminPerson | null;
  office: AdminOffice | null;
  chat?: string;
  callRoom?: string;
  activatedAt?: string;
  finalizedAt?: string;
  patientPresentAt?: string;
  doctorPresentAt?: string;
  dispatchError?: string;
  reminderSentAt?: string;
  reminderError?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt?: string;
  money?: {
    paid?: number;
    refunded?: number;
    refundable?: number;
    doctorPaid?: number;
    subtotal?: number;
    tax?: number;
    total?: number;
    transactions?: Transaction[];
  };
  calls?: CallSummary[];
  feedback?: {
    _id: string;
    overalScore?: number;
    publicMessage?: string;
    privateMessage?: string;
    status?: string;
  } | null;
  resolved?: boolean;
  adminActions?: AdminAction[];
}

const Pair = ({ title, value }: { title: string; value?: ReactNode }) => (
  <div className={classes.pair}>
    <span className={classes.pairTitle}>{title}</span>
    <span className={classes.pairValue}>{value ?? "—"}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className={classes.section}>
    <h2 className={classes.sectionTitle}>{title}</h2>
    {children}
  </section>
);

const cancelledByDict: Record<string, string> = {
  get patient() {
    return ta("بیمار");
  },
  get doctor() {
    return ta("پزشک");
  },
  get admin() {
    return ta("پشتیبانی");
  },
};

const callStatusDict: Record<string, string> = {
  get ringing() {
    return ta("در حال زنگ");
  },
  get active() {
    return ta("در جریان");
  },
  get ended() {
    return ta("پایان‌یافته");
  },
  get cancelled() {
    return ta("لغو شده");
  },
};

const txLabel = (t: Transaction, bookerId?: string) => {
  if (t.adminAction === "payoutReversal") return ta("برگشت تسویه‌ی پزشک");
  if (t.adminAction === "reservationRefund") return ta("بازپرداخت توسط پشتیبانی");
  if (t.doctor) return t.amount >= 0 ? ta("تسویه با پزشک") : ta("برگشت تسویه‌ی پزشک");
  const mine = !bookerId || (t.user?._id || t.user) === bookerId;
  if (mine && t.amount < 0) return ta("پرداخت بیمار");
  if (mine && t.amount > 0) return ta("بازپرداخت به بیمار");
  return ta("سایر");
};

const signed = (amount?: number) =>
  typeof amount === "number"
    ? `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${currencize(Math.abs(amount))}`
    : "—";

const AdminManageReservationPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { user: viewer } = useUser();
  const hasAccess = useAccessLevel();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<IAdminReservation>(
    params?.nodeId ? `${API}/admin/reservations/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const canAct =
    viewer?.role === "admin" || hasAccess("Reservation", "update");
  const money = data?.money || {};
  const refundable = Number(money.refundable) || 0;
  const doctorPaid = Number(money.doctorPaid) || 0;
  const refresh = () => mutate();
  const transactions = Array.isArray(money.transactions) ? money.transactions : [];
  const calls = Array.isArray(data?.calls) ? data.calls : [];
  const history = Array.isArray(data?.adminActions) ? [...data.adminActions].reverse() : [];

  const actions: { title: string; action: () => void; icon?: ReactNode; danger?: boolean }[] = [];
  if (data && canAct) {
    if (data.status === "pending") {
      actions.push({
        title: ta("جابه‌جایی زمان"),
        icon: <CalendarIcon />,
        action: () =>
          setPopup(
            "AdminRescheduleReservation",
            <RescheduleReservationPopup id={data._id} currentDate={data.date} onDone={refresh} />,
          ),
      });
      actions.push({
        title: ta("لغو نوبت"),
        danger: true,
        icon: <XMarkIcon />,
        action: () =>
          setPopup(
            "AdminCancelReservation",
            <CancelReservationPopup id={data._id} refundable={refundable} onDone={refresh} />,
          ),
      });
    }
    if ((data.status === "noShow" || data.status === "error") && !data.resolved)
      actions.push({
        title: ta("حل وضعیت"),
        action: () =>
          setPopup(
            "AdminResolveReservation",
            <ResolveReservationPopup
              id={data._id}
              status={data.status}
              noShowParty={data.noShowParty}
              refundable={refundable}
              doctorPaid={doctorPaid}
              paid={Number(money.paid) || 0}
              refunded={Number(money.refunded) || 0}
              dispute={data.dispute}
              onDone={refresh}
            />,
          ),
      });
    if (
      ["cancelled", "noShow", "error"].includes(data.status) &&
      refundable > 0 &&
      doctorPaid <= 0
    )
      actions.push({
        title: ta("بازپرداخت به بیمار"),
        action: () =>
          setPopup(
            "AdminRefundReservation",
            <RefundReservationPopup id={data._id} refundable={refundable} onDone={refresh} />,
          ),
      });
  }

  const bookerId = data?.user?._id;
  const doctorUser =
    data?.doctor?.user && typeof data.doctor.user === "object" ? data.doctor.user : null;
  const clinic =
    data?.office?.clinic && typeof data.office.clinic === "object" ? data.office.clinic : null;
  const hospital =
    data?.office?.hospital && typeof data.office.hospital === "object" ? data.office.hospital : null;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("نوبت ${1}", [formatDay(data.date)])} actions={actions}>
          <div className={classes.main}>
            <div className={classes.hero}>
              <ReservationStatusBadge status={data.status} noShowParty={data.noShowParty} />
              <span className={classes.when}>
                {formatDay(data.date)} · {hhmm(data.start)}–{hhmm(data.end)}
              </span>
              <span className={classes.muted}>
                {sessionTypeDict[data.sessionType] || data.sessionType}
              </span>
              {data.resolved && (
                <span className={classes.muted}>{ta("وضعیت توسط پشتیبانی حل شده")}</span>
              )}
            </div>

            {!!data.dispute && (
              <div className={classes.alert} role="status">
                <p>
                  {ta("اعتراض بیمار (${1}): ${2}", [
                    formatDateTime(data.dispute.at) || "—",
                    data.dispute.reason || "—",
                  ])}
                </p>
              </div>
            )}
            {!data.dispute && data.autoCompleted && (
              <p className={classes.muted}>
                {ta("ویزیت حضوری بدون ثبت حضور انجام‌شده ثبت شد؛ مهلت اعتراض بیمار تا ${1}", [
                  formatDateTime(data.disputeDeadline) || "—",
                ])}
              </p>
            )}

            {(data.dispatchError || data.reminderError) && (
              <div className={classes.alert} role="status">
                {data.dispatchError && (
                  <p>{ta("خطای باز کردن جلسه: ${1}", [data.dispatchError])}</p>
                )}
                {data.reminderError && (
                  <p>{ta("خطای ارسال یادآوری: ${1}", [data.reminderError])}</p>
                )}
              </div>
            )}

            <div className={classes.grid}>
              <Section title={ta("افراد")}>
                <Pair
                  title={ta("پزشک")}
                  value={
                    data.doctor ? (
                      <InlineLink href={adminPath(`/doctorprofile/${data.doctor._id}`)}>
                        {doctorLabel(data.doctor)}
                      </InlineLink>
                    ) : undefined
                  }
                />
                {doctorUser && (
                  <Pair
                    title={ta("حساب پزشک")}
                    value={
                      <InlineLink href={adminPath(`/user/${doctorUser._id}`)}>
                        {personLabel(doctorUser)}
                      </InlineLink>
                    }
                  />
                )}
                <Pair title={ta("بیمار")} value={identityLabel(data.patient)} />
                <Pair title={ta("کد ملی بیمار")} value={data.patient?.nationalId} />
                <Pair
                  title={ta("رزروکننده")}
                  value={
                    data.user ? (
                      <InlineLink href={adminPath(`/user/${data.user._id}`)}>
                        {personLabel(data.user)}
                      </InlineLink>
                    ) : undefined
                  }
                />
              </Section>

              <Section title={ta("زمان و مکان")}>
                <Pair title={ta("مطب / مرکز")} value={data.office?.name} />
                {clinic && (
                  <Pair
                    title={ta("کلینیک")}
                    value={
                      <InlineLink href={adminPath(`/clinic/${clinic._id}`)}>
                        {clinic.name || ta("بدون نام")}
                      </InlineLink>
                    }
                  />
                )}
                {hospital && (
                  <Pair
                    title={ta("بیمارستان")}
                    value={
                      <InlineLink href={adminPath(`/hospital/${hospital._id}`)}>
                        {hospital.name || ta("بدون نام")}
                      </InlineLink>
                    }
                  />
                )}
                <Pair title={ta("آدرس")} value={data.office?.address} />
                <Pair title={ta("ثبت نوبت")} value={formatDateTime(data.createdAt)} />
                <Pair title={ta("شروع جلسه")} value={formatDateTime(data.activatedAt)} />
                <Pair title={ta("حضور پزشک")} value={formatDateTime(data.doctorPresentAt)} />
                <Pair title={ta("حضور بیمار")} value={formatDateTime(data.patientPresentAt)} />
                <Pair title={ta("نهایی‌شدن")} value={formatDateTime(data.finalizedAt)} />
                {data.status === "cancelled" && (
                  <>
                    <Pair title={ta("لغو")} value={formatDateTime(data.cancelledAt)} />
                    <Pair
                      title={ta("لغوکننده")}
                      value={cancelledByDict[data.cancelledBy || ""] || data.cancelledBy}
                    />
                    <Pair title={ta("دلیل لغو")} value={data.cancelReason} />
                  </>
                )}
              </Section>

              <Section title={ta("صورت‌حساب و پرداخت")}>
                <Pair title={ta("مبلغ ویزیت")} value={currencize(money.subtotal)} />
                <Pair title={ta("مالیات")} value={currencize(money.tax)} />
                <Pair title={ta("جمع")} value={currencize(money.total)} />
                <Pair title={ta("پرداخت‌شده توسط بیمار")} value={currencize(money.paid)} />
                <Pair title={ta("برگشت‌داده‌شده به بیمار")} value={currencize(money.refunded)} />
                <Pair title={ta("قابل بازپرداخت")} value={currencize(refundable)} />
                <Pair title={ta("تسویه‌شده با پزشک (خالص)")} value={currencize(doctorPaid)} />
              </Section>

              {hasInsuranceBreakdown(data as unknown as BreakdownReservation) && (
                <Section title={ta("سهم بیمه")}>
                  <InsuranceBreakdown
                    reservation={data as unknown as BreakdownReservation}
                    text={breakdownTexts()}
                    money={(n) => ta("${1} تومان", [currencize(n)])}
                  />
                </Section>
              )}

              <Section title={ta("جلسه")}>
                {data.chat && <Pair title={ta("گفتگو")} value={data.chat} />}
                {calls.length ? (
                  <ul className={classes.list}>
                    {calls.map((call) => (
                      <li key={call._id}>
                        <InlineLink href={adminPath(`/callroom/${call._id}`)}>
                          {formatDateTime(call.startedAt)}
                        </InlineLink>
                        <span className={classes.muted}>
                          {" · "}
                          {callStatusDict[call.status || ""] || call.status || "—"}
                          {call.recordings ? ` · ${ta("${1} ضبط", [call.recordings])}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !data.chat && <p className={classes.muted}>{ta("تماس یا گفتگویی برای این نوبت ثبت نشده است.")}</p>
                )}
                {data.feedback && (
                  <Pair
                    title={ta("نظر بیمار")}
                    value={
                      <InlineLink href={adminPath("/reviews?tab=visits")}>
                        {ta("${1} از ۵", [data.feedback.overalScore ?? "—"])}
                        {data.feedback.publicMessage ? ` · ${data.feedback.publicMessage}` : ""}
                      </InlineLink>
                    }
                  />
                )}
              </Section>
            </div>

            <Section title={ta("تراکنش‌های این نوبت")}>
              <Table
                name="AdminReservationTransactions"
                data={transactions}
                renderer={{
                  label: {
                    name: ta("بابت"),
                    value: (node) => txLabel(node, bookerId),
                  },
                  amount: {
                    name: ta("مبلغ (تومان)"),
                    value: (node) => node.amount,
                    component: (node) => signed(node.amount),
                  },
                  user: {
                    name: ta("کیف پول"),
                    value: (node) => personLabel(node.user),
                    component: (node) =>
                      node.user ? (
                        <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                          {personLabel(node.user)}
                        </InlineLink>
                      ) : (
                        "—"
                      ),
                  },
                  note: {
                    name: ta("توضیح"),
                    value: (node) =>
                      node.note
                        ? `${node.note}${node.adminBy ? ` (${personLabel(node.adminBy)})` : ""}`
                        : "—",
                  },
                  createdAt: {
                    name: ta("تاریخ"),
                    value: (node) => (node.createdAt ? new Date(node.createdAt) : undefined),
                  },
                }}
              />
            </Section>

            <Section title={ta("اقدامات پشتیبانی")}>
              {history.length ? (
                <ul className={classes.history}>
                  {history.map((entry, index) => (
                    <li key={`${entry.action}-${entry.at}-${index}`}>
                      <strong>{adminActionDict[entry.action] || entry.action}</strong>
                      <span className={classes.muted}>
                        {" · "}
                        {formatDateTime(entry.at)}
                        {entry.by ? ` · ${personLabel(entry.by)}` : ""}
                      </span>
                      {!!entry.amount && (
                        <span>{ta("بازپرداخت ${1} تومان", [currencize(entry.amount)])}</span>
                      )}
                      {!!entry.reversedPayout && (
                        <span>{ta("برگشت تسویه‌ی پزشک ${1} تومان", [currencize(entry.reversedPayout)])}</span>
                      )}
                      {entry.action === "reschedule" && (
                        <span>
                          {ta("از ${1}", [`${formatDay(entry.fromDate)} ${hhmm(entry.fromStart)}`])}
                        </span>
                      )}
                      {entry.reason && <p className={classes.reason}>{entry.reason}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={classes.muted}>{ta("هنوز اقدامی از سوی پشتیبانی ثبت نشده است.")}</p>
              )}
            </Section>
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageReservationPage;
