import { diffDaysYmd, TEHRAN_TZ, tehranTodayYmd, tehranYmd } from "@/Components/helpers/tehranTime";
import { availabilityOfDay, bookableBounds, shiftDateFromNow } from "./availabilityDay";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { useMemo, useState } from "react";
import classes from "./DoctorAvailabilityStrip.module.css";
import { IDoctorAvailability, IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import PlusIcon from "../Icons/PlusIcon";
import { t2xsMedium, txsRegular } from "../UI/Typography";
import BookingSessionSelectorPopup from "./BookingSessionSelectorPopup";
import { BookingPageDoctor } from "./BookingPage2";

const NS: ContentNamespace[] = ["common", "booking"];


const DayCard = ({
  date,
  node,
  onOpen,
}: {
  date: Date;
  node: IDoctorProfile<{ Availabilities: Record<never, never> }>;
  onOpen: (date: Date) => void;
}) => {
  const intlTag = useIntlLocale();
  const getContent = useScopedLocale(NS);

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
    <button
      type="button"
      className={`${classes.dayCard} ${sessionsCount ? "" : classes.dayCardEmpty}`}
      title={`${sessionsCount.toLocaleString(intlTag)} ${getContent("availableSessionsCount")}`}
      onClick={() => onOpen(date)}
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
    </button>
  );
};

const DAY_CARD_COUNT = 3;

// Free slots of the next days, under the shared doctor card on the booking
// search (the Doctolib / Zocdoc availability strip).
const DoctorAvailabilityStrip = ({ node }: { node: BookingPageDoctor }) => {
  const getContent = useScopedLocale(NS);
  // the picker opens as a bottom sheet, on the day tapped
  const [openOn, setOpenOn] = useState<Date | null | undefined>(undefined);
  // today and the next days in Tehran
  const showDates = useMemo<Date[]>(
    () => Array.from({ length: DAY_CARD_COUNT }, (_, i) => shiftDateFromNow(i)),
    [],
  );

  return (
    <div className={classes.sessions}>
      {showDates.map((date) => (
        <DayCard key={date.toISOString()} node={node} date={date} onOpen={setOpenOn} />
      ))}
      <button type="button" className={classes.moreSessions} onClick={() => setOpenOn(null)}>
        <Ixon width="1rem">
          <PlusIcon />
        </Ixon>
        <span>{getContent("more")}</span>
      </button>
      {openOn !== undefined && (
        <BookingSessionSelectorPopup
          node={node}
          initialDate={openOn || undefined}
          open
          onClose={() => setOpenOn(undefined)}
        />
      )}
    </div>
  );
};

export default DoctorAvailabilityStrip;
