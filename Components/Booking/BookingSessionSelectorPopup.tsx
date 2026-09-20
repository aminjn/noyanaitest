import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  IDoctorAvailability,
  IDoctorProfile,
} from "../DoctorPanel/DoctorPanelPage";
import useLocale from "../Hooks/useLocale";
import ClockIcon from "../Icons/ClockIcon";
import PopupCard from "../UI/PopupCard";
import classes from "./BookingSessionSelectorPopup.module.css";
import { range } from "../helpers/lib";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import { IDoctorShift } from "../DoctorPanel/Shift/DoctorManageShiftsPage";
import useShiftUtils from "../DoctorPanel/Shift/useShiftUtils";
import useComplexLocale from "../Hooks/useComplexLocale";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import { tbaseDemiBold, tmdMedium, tsmRegular } from "../UI/Typography";
import Button from "../UI/Button";
import useProgress from "../Hooks/useProgress";
import usePopup from "../Hooks/usePopup";
import useUser from "../Hooks/useUser";
import LoginPopup from "../Popups/LoginPopup";
import AuthPopup from "../Popups/AuthPopup";
import useSWR from "swr";
import { API } from "../config";
import Loading from "../Admin/UI/Loading";
import { fetcher } from "../helpers/fetcher";
import { useRouter } from "next/navigation";
import ChevronIcon from "../Icons/ChevronIcon";

const shiftDateFromNow = (shift: number) => {
  const now = new Date();
  now.setDate(now.getDate() + shift);
  return now;
};

// Builds a YYYY-MM-DD key from the date's local calendar day. Using
// Date#toISOString() here is wrong because it converts to UTC first, which
// rolls the date back a day for any timezone ahead of UTC (e.g. Iran,
// UTC+3:30) whenever the local time is earlier than the UTC offset.
const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SessionButton = ({
  bounds,
  selectedSession,
  setSelectedSession,
}: {
  bounds: [number, number];
  selectedSession: [number, number] | null;
  setSelectedSession: Dispatch<SetStateAction<[number, number] | null>>;
}) => {
  const getCompContent = useComplexLocale();

  return (
    <div
      className={`${classes.session}`}
      onClick={() => setSelectedSession(bounds)}
    >
      <div
        className={`${classes.sessionCheckBox} ${bounds[0] === selectedSession?.[0] && bounds[1] === selectedSession?.[1] ? classes.activeSession : ""}`}
      >
        <Ixon width="1rem" className={`${classes.sessionCheck}`}>
          <CheckIcon />
        </Ixon>
      </div>
      <span>
        {getCompContent("fromTimeXtoTimeY", [
          numberToTime(bounds[0]),
          numberToTime(bounds[1]),
        ])}
      </span>
    </div>
  );
};

const DayBadge = ({
  index,
  selectedDay,
  setSelectedDay,
}: {
  index: number;
  setSelectedDay: Dispatch<SetStateAction<Date>>;
  selectedDay: Date;
}) => {
  const getContent = useLocale();

  return (
    <div
      onClick={() => setSelectedDay(shiftDateFromNow(index))}
      className={`${classes.dayTab} ${selectedDay.toLocaleDateString("fa-IR") === shiftDateFromNow(index).toLocaleDateString("fa-IR") ? classes.activeTab : ""}`}
    >
      <span className={tbaseDemiBold}>
        {index === 0
          ? getContent("today")
          : index === 1
            ? getContent("tomorrow")
            : shiftDateFromNow(index).toLocaleString("fa-IR", {
                weekday: "long",
              })}
      </span>
      <span className={tsmRegular}>
        {shiftDateFromNow(index).toLocaleString("fa-IR", {
          month: "long",
          day: "numeric",
        })}
      </span>
    </div>
  );
};

const BookingSessionSelectorPopup = ({
  node,
  initialDate,
  standalone,
}: {
  node: IDoctorProfile;
  initialDate?: Date;
  standalone?: boolean;
}) => {
  const { data: availabilities } = useSWR<IDoctorAvailability[]>(
    `${API}/public/dr/${node._id}/availability`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { user } = useUser();

  const getContent = useLocale();

  const { closePopup } = usePopup();

  const push = useProgress();

  const [tabView, setTabView] = useState<boolean>(true);

  const [selectedDay, setSelectedDay] = useState<Date>(
    initialDate || new Date(),
  );

  const { setPopup } = usePopup();

  const selectedDateAvailableSessions = useMemo<[number, number][]>(() => {
    if (!availabilities) return [];
    const start = new Date(selectedDay);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const availability = availabilities.find(
      (el) => new Date(el.date) >= start && new Date(el.date) < end,
    );
    if (!availability) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday =
      new Date(availability.date) >= today &&
      new Date(availability.date) < tomorrow;
    if (isToday) {
      const hour = new Date().getHours();
      return availability.bounds
        .filter(({ start }) => start >= (hour + 1) * 60)
        .map(({ start, end }) => [start, end]);
    }
    return availability.bounds.map(({ start, end }) => [start, end]);
  }, [availabilities, selectedDay]);

  const [selectedSession, setSelectedSession] = useState<
    [number, number] | null
  >(null);

  useEffect(() => setSelectedSession(null), [selectedDay]);

  const content = useMemo(
    () => (
      <div className={`${classes.main}`}>
        {tabView && (
          <div className={classes.tabView}>
            <div className={classes.week}>
              {range(0, 5).map((index) => (
                <DayBadge
                  key={index}
                  index={index}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                />
              ))}
            </div>
            <div className={classes.sessions}>
              {selectedDateAvailableSessions.map((bounds) => (
                <SessionButton
                  key={`${bounds[0]}8===D${bounds[1]}`}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                  bounds={bounds}
                />
              ))}
            </div>
          </div>
        )}
        <div
          className={`${classes.toggle} ${!tabView ? classes.activeToggle : ""}`}
          onClick={() => setTabView((prev) => !prev)}
        >
          <div className={classes.toggleCheck}>
            <Ixon width="1rem">
              <CheckIcon />
            </Ixon>
          </div>
          <span>{getContent("selectFromOtherTimes")}</span>
        </div>
        {!tabView && (
          <div className={classes.listView}>
            <div className={classes.side}>
              {range(0, 29).map((index) => (
                <DayBadge
                  key={index}
                  index={index}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                />
              ))}
            </div>
            <div className={classes.sessions}>
              {selectedDateAvailableSessions.map((bounds) => (
                <SessionButton
                  key={`${bounds[0]}8===D${bounds[1]}`}
                  selectedSession={selectedSession}
                  setSelectedSession={setSelectedSession}
                  bounds={bounds}
                />
              ))}
            </div>
          </div>
        )}
        {standalone ? (
          <div className={classes.standaloneActions}>
            <Button
              variant="Neutral"
              mode="Inline"
              size="M"
              radius="High"
              onClick={() => push("/book")}
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
            >
              {getContent("previousStage")}
            </Button>
            <Button
              size="M"
              radius="High"
              mode="Fill"
              variant="Primary"
              onClick={() => {
                if (!selectedSession) return;
                if (!user) {
                  setPopup("Auth", <AuthPopup />);
                  return;
                }
                push(
                  `/book/finalize/${node._id}?d=${toLocalDateKey(selectedDay)}&s=${selectedSession[0]}&e=${selectedSession[1]}`,
                );
              }}
            >
              {getContent("confirmAndContinue")}
            </Button>
          </div>
        ) : (
          <div className={classes.actions}>
            <Button
              variant="Primary"
              mode="Outline"
              size="L"
              radius="High"
              onClick={() => {
                closePopup();
                push(`/dr/${node.slug || node._id}`);
              }}
            >
              {getContent("seeDoctorProfile")}
            </Button>
            <Button
              variant={selectedSession ? "Primary" : "Disable"}
              mode="Fill"
              size="L"
              radius="High"
              onClick={() => {
                if (!selectedSession) return;
                if (!user) {
                  setPopup("Auth", <AuthPopup />);
                  return;
                }
                push(
                  `/book/finalize/${node._id}?d=${toLocalDateKey(selectedDay)}&s=${selectedSession[0]}&e=${selectedSession[1]}`,
                );
                closePopup();
              }}
            >
              {getContent("confirmAndContinue")}
            </Button>
          </div>
        )}
      </div>
    ),
    [
      closePopup,
      getContent,
      node._id,
      node.slug,
      push,
      selectedDateAvailableSessions,
      selectedDay,
      selectedSession,
      setPopup,
      standalone,
      tabView,
      user,
    ],
  );

  if (!availabilities) return <Loading />;
  if (standalone)
    return (
      <div className={classes.standalone}>
        <div className={`${classes.standaloneHeader} ${tmdMedium}`}>
          {getContent("chooseSession")}
        </div>
        <div>{content}</div>
      </div>
    );
  return (
    <PopupCard
      title={getContent("selectSessionTime")}
      icon={<ClockIcon />}
      className={classes.popup}
    >
      {content}
    </PopupCard>
  );
};

export default BookingSessionSelectorPopup;
