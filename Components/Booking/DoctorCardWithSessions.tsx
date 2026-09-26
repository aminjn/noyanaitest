import Image from "next/image";
import {
  IDoctorAvailability,
  IDoctorProfile,
} from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardWithSessions.module.css";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { imagePath } from "../helpers/imagepath";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import HandThumUpIcon from "../Icons/HandThumbUpIcon";
import Link from "@/Components/i18n/Link";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import StarIcon from "../Icons/StarIcon";
import LocationIcon from "../Icons/LocationIcon";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, useMemo } from "react";
import HandleLoading from "../Admin/UI/HandleLoading";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import BookingSessionSelectorPopup from "./BookingSessionSelectorPopup";
import CardWithSession from "./CardWithSession";

const NS: ContentNamespace[] = ["common", "booking"];

// Reads System B (Reservation) availability instead of the old
// DoctorSession-based /week endpoint, and opens BookingSessionSelectorPopup
// (System B) instead of SelectSessionToReservePopup (System A) - the old
// /doctors-page booking flow was retired per F-01, since System A's own
// checkout step can never complete in production. See
// AUDIT/FIXES_TODO.md F-01.
export const Sessions = ({ node }: { node: IDoctorProfile }) => {
  const { data, error } = useSWR<IDoctorAvailability[]>(
    `${API}/public/dr/${node._id}/availability`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { user } = useUser();

  const isAvailable = useMemo<boolean>(
    () => !!data?.some((el) => !!el.bounds.length),
    [data],
  );

  const getContent = useScopedLocale(NS);

  // Local-midnight Date objects, not UTC-ISO-string keys (getSessionDateKey
  // rolls over at UTC midnight, which is the wrong calendar day for a
  // timezone ahead of UTC - see AUDIT/06_DATABASE_DRIFT.md 6.1/F-19). Ranges
  // are matched the same way DoctorCardBooking.tsx's DayCard does for the
  // identical purpose, so the count shown here and the day the popup opens
  // to are the same calendar day the user actually sees.
  const days = useMemo<Date[]>(() => {
    const result: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; ++i) {
      result.push(new Date(now));
      now.setDate(now.getDate() + 1);
    }
    return result;
  }, []);

  const ready = useMemo<Record<number, number>>(() => {
    const result: Record<number, number> = {};
    for (const date of days) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      result[date.getTime()] =
        data?.find((el) => {
          const elDate = new Date(el.date);
          return elDate >= start && elDate < end;
        })?.bounds.length || 0;
    }
    return result;
  }, [data, days]);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Fragment>
          {isAvailable ? (
            <div className={classes.sessions}>
              {days.map((date) => {
                const value = ready[date.getTime()] || 0;
                return (
                  <div
                    key={date.getTime()}
                    className={`${classes.day} ${!value ? classes.full : ""}`}
                    onClick={() => {
                      if (!user) {
                        setPopup("login", <AuthPopup />);
                      } else {
                        setPopup(
                          "BookingSessionSelector",
                          <BookingSessionSelectorPopup
                            node={node}
                            initialDate={date}
                          />,
                        );
                      }
                    }}
                  >
                    <span className={classes.weekDay}>
                      {date.toLocaleDateString("fa-IR", {
                        weekday: "long",
                      })}
                    </span>
                    <span>
                      {date.toLocaleDateString("fa-IR", {
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span>{value}</span>
                    <span className={classes.countLabel}>
                      {getContent("availableSessionCount")}
                    </span>
                  </div>
                );
              })}
              <Link
                href={`/doctor/${node.slug || node._id}/calendar`}
                className={classes.more}
              >
                {getContent("moreSessions")}
              </Link>
            </div>
          ) : (
            <p className={classes.notAvailable}>
              {getContent("doctorNotAvailableMessage")}
            </p>
          )}
        </Fragment>
      )}
    </HandleLoading>
  );
};

const DoctorCardWithSessions = ({
  node,
}: {
  node: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  return (
    <CardWithSession
      name={getDoctorProfileLabel(node)}
      image={node.avatar}
      speciality={node.mainSpeciality}
      target={`/dr/${node.slug || node._id}`}
      address={node.address}
      description={node.introduction}
      doctorProfile={node}
    />
  );
};

export default DoctorCardWithSessions;
