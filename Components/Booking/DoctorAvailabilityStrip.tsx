import { useIntlLocale } from "@/Components/i18n/navigation";
import { useMemo } from "react";
import classes from "./DoctorAvailabilityStrip.module.css";
import { IDoctorAvailability, IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import Ixon from "../UI/Ixon";
import PlusIcon from "../Icons/PlusIcon";
import { t2xsMedium, txsRegular } from "../UI/Typography";
import BookingSessionSelectorPopup from "./BookingSessionSelectorPopup";
import { BookingPageDoctor } from "./BookingPage2";

const NS: ContentNamespace[] = ["common", "booking"];

const addDaysToToday = (days: number) => {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
};

const DayCard = ({
  date,
  node,
}: {
  date: Date;
  node: IDoctorProfile<{ Availabilities: Record<never, never> }>;
}) => {
  const intlTag = useIntlLocale();
  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  const todaysShifs = useMemo<IDoctorAvailability | null>(() => {
    // [start of `date`, start of the next day) - the bounds used to be
    // swapped, so no availability ever matched and every day showed 0
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const list = Array.isArray(node.availabilities) ? node.availabilities : [];
    return (
      list.find(
        (el) => new Date(el.date) >= start && new Date(el.date) < end,
      ) || null
    );
  }, [date, node.availabilities]);

  const distanceFromNow = useMemo<number>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const then = new Date(date);
    return Math.floor((then.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }, [date]);

  const isToday = useMemo<boolean>(
    () => distanceFromNow === 0,
    [distanceFromNow],
  );

  const isTomorrow = useMemo<boolean>(
    () => distanceFromNow === 1,
    [distanceFromNow],
  );

  const isLater = useMemo<boolean>(
    () => !isToday && !isTomorrow,
    [isToday, isTomorrow],
  );

  const sessionsCount = useMemo<number>(() => {
    if (!todaysShifs || !Array.isArray(todaysShifs.bounds)) return 0;
    if (isToday) {
      const hour = new Date().getHours();
      return todaysShifs.bounds.filter((b) => b.start >= (hour + 1) * 60)
        .length;
    } else {
      return todaysShifs.bounds.length;
    }
  }, [isToday, todaysShifs]);

  return (
    <div
      className={`${classes.dayCard} ${sessionsCount ? "" : classes.dayCardEmpty}`}
      title={`${sessionsCount.toLocaleString(intlTag)} ${getContent("availableSessionsCount")}`}
      onClick={() =>
        setPopup(
          "BookingSessionSelector",
          <BookingSessionSelectorPopup node={node} initialDate={date} />,
        )
      }
    >
      <span className={`${classes.dayLabel} ${txsRegular}`}>
        {isToday && getContent("today")}
        {isTomorrow && getContent("tomorrow")}
        {isLater &&
          new Date(date).toLocaleString(intlTag, {
            month: "long",
            day: "numeric",
          })}
      </span>
      <div className={`${classes.dayCardContent} ${t2xsMedium}`}>
        <span className={classes.dayCount}>
          {sessionsCount.toLocaleString(intlTag)}
        </span>
        <span>{getContent("availableSessionsCount")}</span>
      </div>
    </div>
  );
};

const DAY_CARD_COUNT = 3;

// Free slots of the next days, under the shared doctor card on the booking
// search (the Doctolib / Zocdoc availability strip).
const DoctorAvailabilityStrip = ({ node }: { node: BookingPageDoctor }) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const showDates = useMemo<Date[]>(() => {
    const result: Date[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (let i = 0; i < DAY_CARD_COUNT; ++i) {
      result.push(new Date(now));
      now.setDate(now.getDate() + 1);
    }
    return result;
  }, []);

  return (
    <div className={classes.sessions}>
      {showDates.map((date) => (
        <DayCard key={date.toISOString()} node={node} date={date} />
      ))}
      <div
        className={classes.moreSessions}
        onClick={() =>
          setPopup("BookingSessionSelector", <BookingSessionSelectorPopup node={node} />)
        }
      >
        <Ixon width="1rem">
          <PlusIcon />
        </Ixon>
        <span>{getContent("more")}</span>
      </div>
    </div>
  );
};

export default DoctorAvailabilityStrip;
