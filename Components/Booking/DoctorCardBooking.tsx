import { useIntlLocale } from "@/Components/i18n/navigation";
import Image from "next/image";
import {
  IDoctorAvailability,
  IDoctorProfile,
} from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardBooking.module.css";
import { FilePath } from "../config";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import MoreMenusButton from "../UI/MoreMenusButton";
import Ixon from "../UI/Ixon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Badge from "../UI/Badge";
import LocationIcon from "../Icons/LocationIcon";
import { useMemo } from "react";
import usePopup from "../Hooks/usePopup";
import {
  daysOfWeekContentKeys,
  IDoctorShift,
} from "../DoctorPanel/Shift/DoctorManageShiftsPage";
import useShiftUtils from "../DoctorPanel/Shift/useShiftUtils";
import PlusIcon from "../Icons/PlusIcon";
import Button from "../UI/Button";
import VerifyIcon from "../Icons/VerifyIcon";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  txsRegular,
} from "../UI/Typography";
import StarIcon from "../Icons/StarIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import PopupCard from "../UI/PopupCard";
import EditIcon from "../Icons/EditIcon";
import ShareIcon from "../Icons/ShareIcon";
import BookingSessionSelectorPopup from "./BookingSessionSelectorPopup";
import { BookingPageDoctor, BookingView } from "./BookingPage2";
import ReportProblemPopup from "./ReportProblemPopup";
import ScoreBadge from "./ScoreBadge";
import HostedImage from "../UI/HostedImage";
import Link from "@/Components/i18n/Link";
import VerifiedImage from "../UI/VerifiedImage";
import useProgress from "../Hooks/useProgress";
import {
  DoctorSessionType,
  doctorSessionTypes,
} from "../DoctorPanel/Calendar/DoctorCalendarDay";

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

  const { getShiftSessions } = useShiftUtils();

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

const DoctorCardBooking = ({
  node,
  view,
}: {
  node: BookingPageDoctor;
  view: BookingView;
}) => {
  const getContent = useScopedLocale(NS);

  const getCompContent = getContent;

  const todate = useMemo<number>(() => (new Date().getDay() - 6 + 7) % 7, []);

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

  const push = useProgress();

  const intlTag = useIntlLocale();

  // e.g. "ونک، تهران" - district, city, province, whichever are set
  const locationLabel = useMemo<string>(() => {
    const parts = [node.district?.name, node.city?.name, node.province?.name]
      .filter((el): el is string => !!el)
      .filter((el, i, arr) => arr.indexOf(el) === i);
    if (!parts.length) return "";
    try {
      return new Intl.ListFormat(intlTag, {
        style: "short",
        type: "unit",
      }).format(parts);
    } catch {
      return parts.join(" - ");
    }
  }, [intlTag, node.city, node.district, node.province]);

  // types the doctor really offers (search API: active settings covered by
  // a shift); an older API without the field shows no type badges
  const apiTypes = (node as { sessionTypes?: unknown }).sessionTypes;
  const officeAddress = (node as { officeAddress?: unknown }).officeAddress;
  const offeredTypes = useMemo<DoctorSessionType[]>(
    () =>
      Array.isArray(apiTypes)
        ? doctorSessionTypes.filter((el) => apiTypes.includes(el))
        : [],
    [apiTypes],
  );

  const identityBlock = (
    <div className={classes.identity}>
      <VerifiedImage src={node.avatar} alt={getDoctorProfileLabel(node)} />
      <div className={classes.identityContent}>
        <div className={classes.identityDetails}>
          <Link href={`/dr/${node.slug || node._id}`}>
            <span className={`${classes.name} ${tsmDemiBold}`}>
              {getDoctorProfileLabel(node)}
            </span>
          </Link>
          {!!node.mainSpeciality && (
            <span className={`${classes.speciality} ${txsRegular}`}>
              {node.mainSpeciality?.name}
            </span>
          )}
        </div>
        {!!locationLabel && (
          <div className={classes.tags}>
            <span className={`${classes.tag} ${t2xsMedium}`}>
              {locationLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const scoresBlock = (
    <div className={classes.scores}>
      <ScoreBadge
        iconColor="var(--yellow)"
        icon={<StarIcon />}
        value={node.averageScore?.toString() || "0"}
      />
      <ScoreBadge
        icon={<CheckCircleIcon />}
        iconColor="var(--info)"
        value={
          view === "Grid"
            ? node.feedbackCount?.toString() || "0"
            : getCompContent("xPeopleRecommended", [
                node.feedbackCount?.toString() || "0",
              ])
        }
      />
      <MoreMenusButton
        options={[
          {
            title: getContent("reportProblem"),
            onClick: () => push("/contact"),
            icon: <EditIcon />,
          },
          {
            title: getContent("share"),
            onClick: () => {
              const url = `${location.protocol}//${location.host}/dr/${node.slug || node._id}`;
              // navigator.share is missing on most desktop browsers
              if (navigator.share) navigator.share({ url }).catch(() => {});
              else navigator.clipboard?.writeText(url).catch(() => {});
            },
            icon: <ShareIcon />,
          },
        ]}
      />
    </div>
  );

  const onlineTypes = offeredTypes.filter((el) => el !== "inPerson");

  const onlinesBlock = !!onlineTypes.length && (
    <div className={classes.onlines}>
      <div className={classes.inlineHeader}>
        <div className={`${classes.inlineTitle} ${t2xsRegular}`}>
          <Ixon width="1rem">
            <Calendar02Icon />
          </Ixon>
          <span>{getContent("onlineConsult")}</span>
        </div>
      </div>
      <div className={classes.badges}>
        {onlineTypes.map((type) => (
          <Badge
            key={type}
            radius="High"
            color="Primarylight"
            mode="Fill"
            size="S"
          >
            {getContent(type)}
          </Badge>
        ))}
      </div>
    </div>
  );

  const inPersonsBlock = offeredTypes.includes("inPerson") && (
    <div className={classes.inPersons}>
      <div className={classes.inlineHeader}>
        <div className={`${classes.inlineTitle} ${t2xsRegular}`}>
          <Ixon width="1rem">
            <LocationIcon />
          </Ixon>
          <span className={classes.inlineTitle}>
            {`${getContent("address")}: ${
              (typeof officeAddress === "string" && officeAddress) ||
              node.address ||
              locationLabel ||
              "—"
            }`}
          </span>
        </div>
      </div>
      <div className={classes.badges}>
        <Badge radius="High" color="Primarylight" mode="Fill" size="S">
          {getContent("inPerson")}
        </Badge>
      </div>
    </div>
  );

  const sessionsBlock = (
    <div className={classes.sessions}>
      {showDates.map((date) => (
        <DayCard key={date.toISOString()} node={node} date={date} />
      ))}
      <div
        className={classes.moreSessions}
        onClick={() =>
          setPopup(
            "BookingSessionSelector",
            <BookingSessionSelectorPopup node={node} />,
          )
        }
      >
        <Ixon width="1rem">
          <PlusIcon />
        </Ixon>
        <span>{getContent("more")}</span>
      </div>
    </div>
  );

  // one primary action (book) and the profile as the secondary one, the same
  // in both views - the two views used to swap labels and targets
  const actionsBlock = (
    <div className={classes.actions}>
      <Button
        size="M"
        radius="Medium"
        variant="Primary"
        mode="Fill"
        href={`/book/finalize/${node._id}`}
      >
        {getContent("reservation")}
      </Button>
      <Button
        size="M"
        radius="Medium"
        variant="Primary"
        mode="Outline"
        href={`/dr/${node.slug || node._id}`}
      >
        {getContent("seeProfile")}
      </Button>
    </div>
  );

  if (view === "Grid") {
    return (
      <div className={classes.gridMain}>
        <div className={classes.gridTop}>
          {identityBlock}
          {scoresBlock}
        </div>
        {onlinesBlock}
        {inPersonsBlock}
        {sessionsBlock}
        {actionsBlock}
      </div>
    );
  }

  return (
    <div className={`${classes.main}`}>
      {identityBlock}
      {scoresBlock}
      {onlinesBlock}
      {inPersonsBlock}
      {sessionsBlock}
      {actionsBlock}
    </div>
  );
};

export default DoctorCardBooking;
