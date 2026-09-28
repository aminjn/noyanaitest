import { useIntlLocale } from "@/Components/i18n/navigation";
import FormatDate from "@/Components/UI/FormatDate";
import classes from "./DoctorCalendarDay.module.css";
import useSWR from "swr";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { DoctorPopulation } from "@/Components/Admin/Doctor/AdminManageDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Link from "@/Components/i18n/Link";
import EyeIcon from "@/Components/Icons/EyeIcon";
import useProgress from "@/Components/Hooks/useProgress";
import { Fragment, useMemo } from "react";
import { getSessionDateKey } from "@/Components/helpers/lib";
import { IOffice, OfficePopulation } from "../Office/DoctorManageOfficesPage";
import {
  IUserIdentity,
  UserIdentityPopulation,
} from "@/Components/Dashboard/DashboardPage";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelCalendar"];

export type BookingPopulation = Population<{
  Session: DoctorSessionPopulation;
  User: boolean;
  Doctor: DoctorProfilePopulation;
  Patient: UserIdentityPopulation;
}>;

export interface IBooking<
  T extends BookingPopulation = BookingPopulation,
> extends MongoDoc {
  session: T["Session"] extends DoctorSessionPopulation
    ? IDoctorSession<T["Session"]>
    : string;
  user: T["User"] extends true ? IUser : string;
  doctor: T["Doctor"] extends DoctorProfilePopulation ? IDoctorProfile : string;
  bookedAt: Date;
  message?: string;
  kind: DoctorSessionType;
  bookPrice: number;
  patient: T["Patient"] extends UserIdentityPopulation
    ? IUserIdentity<T["Patient"]>
    : string;
}

export const doctorSessionTypes = [
  "textChat",
  "sipCall",
  "voiceCall",
  "videoCall",
  "inPerson",
] as const;

export type DoctorSessionType = (typeof doctorSessionTypes)[number];

export const doctorSessionTypeContentKeyDict: Record<
  DoctorSessionType,
  ContentKey
> = {
  inPerson: "inPerson",
  sipCall: "sipCall",
  textChat: "textChat",
  videoCall: "videoCall",
  voiceCall: "voiceCall",
};

export const patientStatuses = ["oldPatient", "newPatient"] as const;

export type PatientStatus = (typeof patientStatuses)[number];

export type DoctorSessionPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Booking: BookingPopulation;
  Clinic: OfficePopulation;
}>;

export type IDoctorSession<
  T extends DoctorSessionPopulation = DoctorSessionPopulation,
> = MongoDoc & {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  date: string;
  start: number;
  end: number;
  booking?: T["Booking"] extends BookingPopulation
    ? IBooking<T["Booking"]> | null
    : void;
  note?: string;
  createdAt: Date;
  clinic?: T["Clinic"] extends OfficePopulation ? IOffice<T["Clinic"]> : string;
} & Partial<Record<DoctorSessionType, boolean>> &
  Partial<Record<PatientStatus, boolean>>;

const DoctorCalendarDay = ({
  stamp,
  onSelect,
  selected,
  isOut,
}: {
  isOut: boolean;
  stamp: Date;
  selected?: boolean;
  onSelect: () => void;
}) => {
  const intlTag = useIntlLocale();
  const { data } = useSWR<IDoctorSession<{ Booking: Record<string, never> }>[]>(
    isOut ? null : `${API}/doctor/calendar/${getSessionDateKey(stamp)}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const push = useProgress();

  const past = useMemo<boolean>(() => {
    const now = new Date();
    const then = new Date(stamp);
    return then < now;
  }, [stamp]);

  return (
    <div
      className={`${classes.main} ${isOut ? classes.out : ""} ${
        past ? classes.past : ""
      }`}
      onClick={() => {
        if (past || isOut) return;
        onSelect();
      }}
    >
      {!isOut && (
        <span
          className={`${classes.checkBox} ${selected ? classes.selected : ""}`}
        >
          {selected && (
            <Ixon width=".875rem">
              <CheckIcon />
            </Ixon>
          )}
        </span>
      )}
      <div className={classes.info}>
        <span className={classes.stamp}>
          {new Date(stamp).toLocaleDateString(intlTag, {
            month: "long",
            day: "numeric",
          })}
        </span>
        {!isOut && (
          <Fragment>
            <span className={classes.pair}>
              <span className={classes.pairTitle}>
                {getContent("availableSessionsCount")}
              </span>
              <span>{(Array.isArray(data) ? data : []).filter((el) => !el.booking).length}</span>
            </span>
            <span className={classes.pair}>
              <span className={classes.pairTitle}>
                {getContent("reservedSessionsCount")}
              </span>
              <span>{(Array.isArray(data) ? data : []).filter((el) => !!el.booking).length}</span>
            </span>
          </Fragment>
        )}
      </div>
      {!isOut && (
        <Fragment>
          <Link
            href={`/doctorpanel/calendar/${stamp.getTime()}`}
            className={classes.link}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              e.nativeEvent.stopPropagation();
              push(`/doctorpanel/calendar/${stamp.getTime()}`);
            }}
          >
            <Ixon width=".875rem">
              <EyeIcon />
            </Ixon>
          </Link>
          <div className={classes.tooltip}>
            {doctorSessionTypes.map((kind) => (
              <div key={kind} className={classes.tooltipPair}>
                <span>{getContent(kind)}</span>
                <span>{(Array.isArray(data) ? data : []).filter((el) => !!el[kind]).length}</span>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default DoctorCalendarDay;
