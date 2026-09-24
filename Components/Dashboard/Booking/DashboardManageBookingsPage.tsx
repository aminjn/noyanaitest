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
import Table from "@/Components/Admin/UI/Table";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
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
  createdAt: Date;
}

const DashboardManageBookingsPage = () => {
  const { data, error } = useSWR<
    IReservation<{
      Doctor: Record<never, never>;
      Office: Record<never, never>;
      User: Record<never, never>;
    }>[]
  >(`${API}/user/reservation`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="DashboardManageBookings"
          renderer={{
            user: {
              name: getContent("reserveUser"),
              value: (node) => node.user.phone,
              filter: "Text",
            },
            doctor: {
              name: getContent("doctor"),
              value: (node) => getDoctorProfileLabel(node.doctor),
              filter: "Text",
              component: (node) => (
                <InlineLink href={`/dr/${node.doctor.slug || node.doctor._id}`}>
                  {getDoctorProfileLabel(node.doctor)}
                </InlineLink>
              ),
            },
            date: {
              name: getContent("sessionDate"),
              value: (node) => new Date(node.date),
              filter: "Date",
              component: (node) => (
                <FormatDate value={node.date} time={false} />
              ),
            },
            start: {
              name: getContent("sessionStart"),
              value: (node) => node.start,
              filter: "Number",
              component: (node) => numberToTime(node.start),
            },
            end: {
              name: getContent("sessionEnd"),
              value: (node) => node.end,
              filter: "Number",
              component: (node) => numberToTime(node.end),
            },
            office: {
              name: getContent("office"),
              value: (node) => node.office.name,
              filter: "Text",
            },
            sessionType: {
              name: getContent("sessionType"),
              value: (node) =>
                getContent(doctorSessionTypeContentKeyDict[node.sessionType]),
              filter: "Set",
            },
            status: {
              name: getContent("status"),
              value: (node) => node.status,
              filter: "Set",
              component: (node) => (
                <ReservationStatusBadge status={node.status} />
              ),
            },
            createdAt: {
              name: getContent("submittedAt"),
              value: (node) => new Date(node.createdAt),
              filter: "Date",
              component: (node) => <FormatDate value={node.createdAt} />,
            },
            actions: {
              name: getContent("actions"),
              component: (node) => (
                <TableActions>
                  <IconLink href={`/dashboard/booking/${node._id}`}>
                    <EyeIcon />
                  </IconLink>
                </TableActions>
              ),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DashboardManageBookingsPage;
