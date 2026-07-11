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
import useLocale from "../Hooks/useLocale";
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
import useComplexLocale from "../Hooks/useComplexLocale";
import PopupCard from "../UI/PopupCard";
import EditIcon from "../Icons/EditIcon";
import ShareIcon from "../Icons/ShareIcon";
import BookingSessionSelectorPopup from "./BookingSessionSelectorPopup";
import { BookingPageDoctor } from "./BookingPage2";
import ReportProblemPopup from "./ReportProblemPopup";
import ScoreBadge from "./ScoreBadge";

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
  const getContent = useLocale();

  const { setPopup } = usePopup();

  const { getShiftSessions } = useShiftUtils();

  const todaysShifs = useMemo<IDoctorAvailability | null>(() => {
    const now = new Date(date);
    now.setHours(0, 0, 0, 0);
    const then = new Date(now);
    now.setDate(now.getDate() + 1);
    return (
      node.availabilities.find(
        (el) => new Date(el.date) >= now && new Date(el.date) < then,
      ) || null
    );
  }, []);

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
    if (!todaysShifs) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const then = new Date(now);
    then.setDate(then.getDate() + 1);
    if (isToday) {
      const hour = new Date().getHours();
      return todaysShifs.bounds.filter((b) => b.start >= (hour + 1) * 60)
        .length;
    } else {
      return todaysShifs.bounds.length;
    }
  }, [getShiftSessions, todaysShifs]);

  return (
    <div
      className={classes.dayCard}
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
          new Date(date).toLocaleString("fa-IR", {
            month: "long",
            day: "numeric",
          })}
      </span>
      <div className={`${classes.dayCardContent} ${t2xsMedium}`}>
        <span>{getContent("availableSessionsCount")}</span>
        <span>{sessionsCount}</span>
      </div>
    </div>
  );
};

const DAY_CARD_COUNT = 3;

const DoctorCardBooking = ({ node }: { node: BookingPageDoctor }) => {
  const getContent = useLocale();

  const getCompContent = useComplexLocale();

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

  return (
    <div className={classes.main}>
      <div className={classes.identity}>
        <div className={classes.image}>
          <Image
            className={classes.theImage}
            src={`${FilePath}/${node.avatar}`}
            alt={getDoctorProfileLabel(node)}
            fill
            style={{ objectFit: "cover" }}
            sizes="3.5rem"
          />
          <div className={classes.onlineBadge} />
          <Ixon className={classes.verifiedBadge} width="1rem">
            <VerifyIcon />
          </Ixon>
        </div>
        <div className={classes.identityContent}>
          <div className={classes.identityDetails}>
            <span className={`${classes.name} ${tsmDemiBold}`}>
              {getDoctorProfileLabel(node)}
            </span>
            {!!node.mainSpeciality && (
              <span className={`${classes.speciality} ${txsRegular}`}>
                {node.mainSpeciality?.name}
              </span>
            )}
          </div>
          <div className={classes.tags}>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag1</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag2</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag3</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag4</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag5</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag5</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag5</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag5</span>
            <span className={`${classes.tag} ${t2xsMedium}`}>tag5</span>
          </div>
        </div>
      </div>
      <div className={classes.scores}>
        <ScoreBadge iconColor="var(--yellow)" icon={<StarIcon />} value="4.5" />
        <ScoreBadge
          icon={<CheckCircleIcon />}
          iconColor="var(--info)"
          value={getCompContent("xPeopleRecommended", ["20"])}
        />
        <MoreMenusButton
          options={[
            {
              title: getContent("reportProblem"),
              onClick: () => setPopup("reportproblem", <ReportProblemPopup />),
              icon: <EditIcon />,
            },
            {
              title: getContent("share"),
              onClick: () => {
                navigator.share({
                  text: `${location.protocol}//${location.host}/doctor/${node.slug || node._id}`,
                });
              },
              icon: <ShareIcon />,
            },
          ]}
        />
      </div>
      {/* TODO: make this */}
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
          <Badge radius="High" color="Primarylight" mode="Fill" size="S">
            {getContent("videoCall")}
          </Badge>
          <Badge radius="High" color="Primarylight" mode="Fill" size="S">
            {getContent("voiceCall")}
          </Badge>
          <Badge radius="High" color="Primarylight" mode="Fill" size="S">
            {getContent("textChat")}
          </Badge>
        </div>
      </div>
      <div className={classes.inPersons}>
        <div className={classes.inlineHeader}>
          <div className={classes.withMap}>
            <div className={`${classes.inlineTitle} ${t2xsRegular}`}>
              <Ixon width="1rem">
                <LocationIcon />
              </Ixon>
              <span
                className={classes.inlineTitle}
              >{`${getContent("address")}: ${node.province ? node.province.name || "-" : "-"}`}</span>
            </div>
            <button
              className={`${classes.mapButton} ${t2xsRegular}`}
              type="button"
            >
              {getContent("seeOnMap")}
            </button>
          </div>
        </div>
        <div className={classes.badges}>
          <Badge radius="High" color="Primarylight" mode="Fill" size="S">
            {getContent("inPerson")}
          </Badge>
          <Badge radius="High" color="Primarylight" mode="Fill" size="S">
            {getContent("sipCall")}
          </Badge>
        </div>
      </div>
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
      <div className={classes.actions}>
        <Button size="M" radius="Medium" variant="Primary" mode="Fill">
          {getContent("reservation")}
        </Button>
        <Button size="M" radius="Medium" variant="Primary" mode="Fill">
          {getContent("onlineConsult")}
        </Button>
      </div>
    </div>
  );
};

export default DoctorCardBooking;
