"use client";

import useSWR from "swr";
import classes from "./DashboardManageBookingsPage.module.css";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
  IBooking,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { IUserIdentity, UserIdentityPopulation } from "../DashboardPage";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import {
  IOffice,
  OfficePopulation,
} from "@/Components/DoctorPanel/Office/DoctorManageOfficesPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import ReservationStatusBadge from "./ReservationStatusBadge";
import ReservationJoinButton from "./ReservationJoinButton";
import { useMemo, useState } from "react";
import Link from "@/Components/i18n/Link";
import { useIntlLocale } from "@/Components/i18n/navigation";
import AssistantStrip from "@/Components/UI/AssistantStrip";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import HostedImage from "@/Components/UI/HostedImage";
import Ixon from "@/Components/UI/Ixon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ReservationParty, ReservationStatus } from "./reservationStatus";

const NS: ContentNamespace[] = ["common", "dashboardBooking"];

export type CheckoutPopulation = Population<{ User: UserPopulation }>;

export interface ICheckout<
  T extends CheckoutPopulation = CheckoutPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  amount: number;
  createdAt: Date;
}

export type TransactionPopulation = Population<{
  User: UserPopulation;
  Checkout: CheckoutPopulation;
  Reservation: ReservationPopulation;
  Doctor: DoctorProfilePopulation;
}>;

export interface ITransaction<
  T extends TransactionPopulation = TransactionPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  amount: number;
  checkout?: T["Checkout"] extends CheckoutPopulation
    ? ICheckout<T["Checkout"]>
    : string;
  // the reservation/booking this transaction is for - e.g. the patient's
  // payment when it's created, or the doctor's payout once it completes
  reservation?: T["Reservation"] extends ReservationPopulation
    ? IReservation<T["Reservation"]>
    : string;
  // set on the doctor's payout transaction, since `user` there is the
  // doctor's linked User account, not the DoctorProfile itself
  doctor?: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  // the cart order this transaction paid for
  order?: string;
  // set on the wallet credit from a verified SEP online payment (2026-09)
  gatewayPayment?: string;
  createdAt: Date;
}

export type ReservationPopulation = Population<{
  User: UserPopulation;
  Patient: UserIdentityPopulation;
  Doctor: DoctorProfilePopulation;
  Office: OfficePopulation;
  Transaction: TransactionPopulation;
}>;

export interface IReservation<
  T extends ReservationPopulation = ReservationPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  patient: T["Patient"] extends UserIdentityPopulation
    ? IUserIdentity<T["Patient"]>
    : string;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  date: Date;
  start: number;
  end: number;
  office: T["Office"] extends OfficePopulation ? IOffice<T["Office"]> : string;
  sessionType: DoctorSessionType;
  transaction?: T["Transaction"] extends TransactionPopulation
    ? ITransaction<T["Transaction"]>
    : string;
  status: ReservationStatus;
  // set by the cron sweep when it dispatches a textChat / voiceCall /
  // videoCall session — unpopulated refs, just used to build a "join" link
  chat?: string;
  callRoom?: string;
  activatedAt?: Date;
  reminderSentAt?: Date;
  patientPresentAt?: Date;
  doctorPresentAt?: Date;
  noShowParty?: ReservationParty;
  finalizedAt?: Date;
  // in-person visit counted as done with no check-in: the patient may
  // object until disputeDeadline (2026-10)
  autoCompleted?: boolean;
  disputeDeadline?: string;
  dispute?: { at: string; reason: string } | null;
  subtotal?: number;
  tax?: number;
  total?: number;
  cancelledAt?: Date;
  cancelledBy?: ReservationParty;
  cancelReason?: string;
  createdAt: Date;
}

type PatientReservation = IReservation<{
  Doctor: Record<never, never>;
  Office: Record<never, never>;
  User: Record<never, never>;
}> & { intakeFilled?: boolean };

const TABS = ["upcoming", "past", "cancelled", "all"] as const;
type Tab = (typeof TABS)[number];
const tabKeys: Record<Tab, ContentKey> = {
  upcoming: "pbTabUpcoming",
  past: "pbTabPast",
  cancelled: "pbTabCancelled",
  all: "pbTabAll",
};
const OPEN = ["pending", "active"];

// Patient's appointments as cards: upcoming first (soonest on top), with
// the questionnaire status, join / details, and "book again" on past ones.
const DashboardManageBookingsPage = () => {
  const { data, error } = useSWR<PatientReservation[]>(`${API}/user/reservation`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const fmt = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(intlTag, { weekday: "long" }),
      day: new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" }),
    }),
    [intlTag],
  );
  const time = (m: number) => {
    const two = (n: number) => num.format(n).padStart(2, num.format(0));
    return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
  };
  const [tab, setTab] = useState<Tab>("upcoming");
  const [onlyNoIntake, setOnlyNoIntake] = useState(false);

  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const groups = useMemo(() => {
    const byTime = (a: PatientReservation, b: PatientReservation) =>
      new Date(a.date).getTime() - new Date(b.date).getTime() || a.start - b.start;
    const upcoming = list.filter((r) => OPEN.includes(r.status)).sort(byTime);
    const past = list.filter((r) => !OPEN.includes(r.status) && r.status !== "cancelled").sort((a, b) => byTime(b, a));
    const cancelled = list.filter((r) => r.status === "cancelled").sort((a, b) => byTime(b, a));
    return { upcoming, past, cancelled, all: [...upcoming, ...past, ...cancelled] };
  }, [list]);
  const noIntake = groups.upcoming.filter((r) => !r.intakeFilled);
  const shown = onlyNoIntake ? noIntake : groups[tab];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("pbTitle")}</h1>
            <div className={classes.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={!onlyNoIntake && tab === t}
                  className={`${classes.tab} ${!onlyNoIntake && tab === t ? classes.tabOn : ""}`}
                  onClick={() => {
                    setTab(t);
                    setOnlyNoIntake(false);
                  }}
                >
                  {getContent(tabKeys[t])}
                  <span className={classes.tabCount}>{num.format(groups[t].length)}</span>
                </button>
              ))}
            </div>
            <Link href="/book" className={classes.newBtn}>
              {getContent("pbBookNew")}
            </Link>
          </header>

          <AssistantStrip
            title={getContent("pbAssistant")}
            clearLabel={getContent("pbClear")}
            onClear={() => setOnlyNoIntake(false)}
            chips={
              noIntake.length
                ? [
                    {
                      key: "intake",
                      label: getContent("pbAiNoIntake", [num.format(noIntake.length)]),
                      active: onlyNoIntake,
                      onClick: () => setOnlyNoIntake(!onlyNoIntake),
                    },
                  ]
                : []
            }
          />

          {!shown.length ? (
            <div className={classes.empty}>
              <p>{tab === "upcoming" && !onlyNoIntake ? getContent("pbEmptyUpcoming") : getContent("pbEmpty")}</p>
              {tab === "upcoming" && (
                <Link href="/book" className={classes.newBtn}>
                  {getContent("pbBookNew")}
                </Link>
              )}
            </div>
          ) : (
            <ul className={classes.grid}>
              {shown.map((r) => {
                const doctor = r.doctor as unknown as {
                  _id?: string;
                  firstName?: string;
                  lastName?: string;
                  avatar?: string;
                  slug?: string;
                  mainSpeciality?: { name?: string } | string | null;
                } | null;
                const name = [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ") || "—";
                const speciality =
                  doctor?.mainSpeciality && typeof doctor.mainSpeciality === "object" ? doctor.mainSpeciality.name : "";
                const open = OPEN.includes(r.status);
                const d = new Date(r.date);
                return (
                  <li key={r._id} className={`${classes.card} ${open ? "" : classes.closed}`}>
                    <div className={classes.top}>
                      {doctor?.avatar ? (
                        <span className={classes.photo}>
                          <HostedImage src={doctor.avatar} alt={name} fill sizes="3rem" style={{ objectFit: "cover" }} />
                        </span>
                      ) : (
                        <InitialAvatar name={name} seed={doctor?._id || r._id} size="3rem" />
                      )}
                      <div className={classes.who}>
                        <strong>{name}</strong>
                        {!!speciality && <span>{speciality}</span>}
                      </div>
                      <ReservationStatusBadge status={r.status} />
                    </div>
                    <div className={classes.when}>
                      <div>
                        <span>{fmt.weekday.format(d)}</span>
                        <strong>{fmt.day.format(d)}</strong>
                      </div>
                      <div>
                        <span>{getContent(doctorSessionTypeContentKeyDict[r.sessionType])}</span>
                        <strong>
                          {time(r.start)}
                          {r.office?.name ? ` · ${r.office.name}` : ""}
                        </strong>
                      </div>
                    </div>
                    {open && (
                      <span className={r.intakeFilled ? classes.chipOk : classes.chipTodo}>
                        <Ixon width="0.8rem">
                          <SparkIcon />
                        </Ixon>
                        {r.intakeFilled ? getContent("pbIntakeDone") : getContent("pbIntakeTodo")}
                      </span>
                    )}
                    <div className={classes.actions}>
                      {r.status === "active" && (!!r.chat || !!r.callRoom) && (
                        <ReservationJoinButton chat={r.chat} callRoom={r.callRoom} sessionType={r.sessionType} />
                      )}
                      <Link href={`/dashboard/booking/${r._id}`} className={classes.primary}>
                        {open && !r.intakeFilled ? getContent("pbFillIntake") : getContent("pbDetails")}
                      </Link>
                      {!open && !!doctor?.slug && (
                        <Link href={`/dr/${doctor.slug}`} className={classes.ghost}>
                          {getContent("pbBookAgain")}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageBookingsPage;
