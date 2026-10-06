import { diffDaysYmd, TEHRAN_TZ, tehranTodayYmd, tehranYmd } from "@/Components/helpers/tehranTime";
import { availabilityOfDay, bookableBounds, shiftDateFromNow } from "./availabilityDay";
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

  // the record of this Tehran day (Components/Booking/availabilityDay.ts)
  const todaysShifs = useMemo<IDoctorAvailability | null>(
    () => availabilityOfDay(node.availabilities, date) || null,
    [date, node.availabilities],
  );

  const distanceFromNow = useMemo<number>(() => diffDaysYmd(tehranTodayYmd(), tehranYmd(date)), [date]);

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

  // today: from the next hour on, in Tehran
  const sessionsCount = useMemo<number>(() => bookableBounds(todaysShifs || undefined).length, [todaysShifs]);

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
            timeZone: TEHRAN_TZ,
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
  // today and the next days in Tehran
  const showDates = useMemo<Date[]>(
    () => Array.from({ length: DAY_CARD_COUNT }, (_, i) => shiftDateFromNow(i)),
    [],
  );

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
