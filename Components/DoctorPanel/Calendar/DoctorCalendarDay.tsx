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
import useLocale from "@/Components/Hooks/useLocale";
import Link from "next/link";
import EyeIcon from "@/Components/Icons/EyeIcon";
import useProgress from "@/Components/Hooks/useProgress";
import { Fragment, useMemo } from "react";
import { getSessionDateKey } from "@/Components/helpers/lib";

export type BookingPopulation = Population<{
  Session: DoctorSessionPopulation;
  User: boolean;
  Doctor: DoctorProfilePopulation;
}>;

export interface IBooking<T extends BookingPopulation = BookingPopulation>
  extends MongoDoc {
  session: T["Session"] extends DoctorSessionPopulation
    ? IDoctorSession<T["Session"]>
    : string;
  user: T["User"] extends true ? IUser : string;
  doctor: T["Doctor"] extends DoctorProfilePopulation ? IDoctorProfile : string;
  bookedAt: Date;
  message?: string;
  kind: DoctorSessionType;
  bookPrice: number;
}

export const doctorSessionTypes = [
  "textChat",
  "sipCall",
  "voiceCall",
  "videoCall",
  "inPerson",
] as const;

export type DoctorSessionType = (typeof doctorSessionTypes)[number];
export type DoctorSessionPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Booking: BookingPopulation;
}>;

export type IDoctorSession<
  T extends DoctorSessionPopulation = DoctorSessionPopulation
> = MongoDoc & {
  doctor: T["Doctor"] extends DoctorProfilePopulation ? IDoctorProfile : string;
  date: string;
  start: number;
  end: number;
  booking?: T["Booking"] extends BookingPopulation
    ? IBooking<T["Booking"]> | null
    : void;
  note?: string;
  createdAt: Date;
} & Partial<Record<DoctorSessionType, boolean>>;

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
  const { data } = useSWR<IDoctorSession<{ Booking: Record<string, never> }>[]>(
    isOut ? null : `${API}/doctor/calendar/${getSessionDateKey(stamp)}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

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
          {new Date(stamp).toLocaleDateString("fa-IR", {
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
              <span>{data?.filter((el) => !el.booking).length}</span>
            </span>
            <span className={classes.pair}>
              <span className={classes.pairTitle}>
                {getContent("reservedSessionsCount")}
              </span>
              <span>{data?.filter((el) => !!el.booking).length}</span>
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
                <span>{data?.filter((el) => !!el[kind]).length}</span>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default DoctorCalendarDay;
