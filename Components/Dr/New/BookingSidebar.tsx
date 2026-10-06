"use client";
import TehranTimeHint from "@/Components/Booking/TehranTimeHint";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./BookingSidebar.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import useUser from "@/Components/Hooks/useUser";
import useProgress from "@/Components/Hooks/useProgress";
import Ixon from "@/Components/UI/Ixon";
import Button from "@/Components/UI/Button";
import SelectInput from "@/Components/UI/SelectInput";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { getSessionDateKey } from "@/Components/helpers/lib";
import {
  DoctorSessionType,
  doctorSessionTypeContentKeyDict,
  doctorSessionTypes,
} from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { numberToTime } from "@/Components/DoctorPanel/Calendar/AddSessionsAgent";
import { IDoctorAvailability } from "@/Components/DoctorPanel/DoctorPanelPage";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import VideoIcon from "@/Components/Icons/VideoIcon";
import HospitalIcon from "@/Components/Icons/HospitalIcon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import ChatBubbleIcon from "@/Components/Icons/ChatBubbleIcon";
import UserAddIcon from "@/Components/Icons/UserAddIcon";
import UserCheckIcon from "@/Components/Icons/UserCheckIcon";
import AuthPopup from "@/Components/Popups/AuthPopup";
import { PublicDoctorProfilePageProps } from "../publicDoctorTypes";
import SelectClinicFirstPopup from "../SelectClinicFirstPopup";
import {
  DoctorConfig,
  PatientType,
  patientTypeDict,
  patientTypes,
} from "../PublicDrSessions";
import { availabilityOfDay, bookableBounds, shiftDateFromNow } from "@/Components/Booking/availabilityDay";

const NS: ContentNamespace[] = ["common", "drBookingSidebar"];

type DoctorType = PublicDoctorProfilePageProps["doctor"];

const visitTypeIcon: Record<DoctorSessionType, ReactNode> = {
  videoCall: <VideoIcon />,
  inPerson: <HospitalIcon />,
  voiceCall: <CallCallingIcon />,
  sipCall: <CallCallingIcon />,
  textChat: <ChatBubbleIcon />,
};

// "today + N" is a Tehran day, shared with BookingSessionSelectorPopup.tsx
// (Components/Booking/availabilityDay.ts)

const DAYS_SHOWN = 7;

const BookingSidebar = ({ doctor }: { doctor: DoctorType }) => {
  const intlTag = useIntlLocale();
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const { user } = useUser();
  const push = useProgress();

  const { data: config } = useSWR<DoctorConfig>(
    `${API}/public/doctor/${doctor._id}/config`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // Same source and shape BookingSessionSelectorPopup.tsx reads from -
  // System B (Reservation) availability, one document per day with a flat
  // list of already-free (unreserved) bounds.
  const { data: availabilities } = useSWR<IDoctorAvailability[]>(
    `${API}/public/dr/${doctor._id}/availability`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [sessionType, setSessionType] = useState<DoctorSessionType | null>();
  const [patientType, setPatientType] = useState<PatientType>("new");
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(
    null,
  );
  const [selectedClinic, setSelectedClinic] = useState<string>();

  const [selectedDay, setSelectedDay] = useState<Date>(() => shiftDateFromNow(0));
  const [selectedSession, setSelectedSession] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    if (!config) return;
    setSessionType((prev) =>
      prev !== undefined
        ? prev
        : doctorSessionTypes.find((st) => config[st]?.active) || null,
    );
  }, [config]);

  // bookable in-person places; a single one is picked for the patient
  // (the "pick a clinic" popup used to open on page load, before any click)
  const offices = useMemo(
    () =>
      (Array.isArray(config?.offices) ? config.offices : []).filter(
        (office) => office && office.active !== false,
      ),
    [config],
  );

  useEffect(() => {
    if (offices.length === 1 && !selectedClinic)
      setSelectedClinic(offices[0]._id);
  }, [offices, selectedClinic]);

  // Same reset-on-day-change behavior as the popup, so a stale [start, end]
  // from a previously selected day is never carried over silently.
  useEffect(() => setSelectedSession(null), [selectedDay]);

  const activeTypes = useMemo(
    () => (config ? doctorSessionTypes.filter((st) => config[st]?.active) : []),
    [config],
  );

  const price = sessionType ? config?.[sessionType]?.price : undefined;
  const hidePrice = sessionType ? config?.[sessionType]?.hidePrice : false;

  const days = useMemo(
    () => Array.from({ length: DAYS_SHOWN }, (_, i) => shiftDateFromNow(i)),
    [],
  );

  const availableCountByDay = useMemo<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    if (!availabilities) return result;
    for (const date of days)
      result[getSessionDateKey(date)] = bookableBounds(availabilityOfDay(availabilities, date)).length;
    return result;
  }, [availabilities, days]);

  // Identical logic to BookingSessionSelectorPopup.tsx's
  // selectedDateAvailableSessions - same day-window match, same
  // hide-past-slots-for-today rule.
  const selectedDateAvailableSessions = useMemo<[number, number][]>(
    () => bookableBounds(availabilityOfDay(availabilities, selectedDay)),
    [availabilities, selectedDay],
  );

  const confirmReservation = () => {
    if (sessionType === "inPerson" && !!offices.length && !selectedClinic) {
      setPopup("SelectClinicFirst", <SelectClinicFirstPopup />);
      return;
    }
    if (!selectedSession) return;
    if (!user) {
      setPopup("Auth", <AuthPopup />);
      return;
    }
    push(
      `/book/finalize/${doctor._id}?d=${getSessionDateKey(selectedDay)}&s=${selectedSession[0]}&e=${selectedSession[1]}${sessionType ? `&t=${sessionType}` : ""}`,
    );
  };

  return (
    <div className={classes.sidebar}>
      <h3 className={classes.sidebarTitle}>{getContent("reserveYourSpot")}</h3>
      {!!activeTypes.length && (
        <div className={classes.sidebarBlock}>
          <legend className={classes.sidebarLabel}>
            {getContent("sessionType")}
          </legend>
          <div className={classes.visitGrid}>
            {activeTypes.map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setSessionType(st)}
                className={`${classes.visitOption} ${
                  sessionType === st ? classes.visitOptionActive : ""
                }`}
              >
                <span className={classes.visitOptionHeader}>
                  <span>{getContent(doctorSessionTypeContentKeyDict[st])}</span>
                </span>
                {!config?.[st]?.hidePrice && !!config?.[st]?.price && (
                  <span className={classes.visitOptionPrice}>
                    {`${currencize(config![st]!.price!)} ${getContent("toman")}`}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={classes.sidebarBlock}>
        <legend className={classes.sidebarLabel}>
          {getContent("patientType")}
        </legend>
        <div className={classes.patientGrid}>
          {patientTypes.map((pt) => (
            <button
              type="button"
              key={pt}
              onClick={() => setPatientType(pt)}
              className={`${classes.patientOption} ${
                patientType === pt ? classes.patientOptionActive : ""
              }`}
            >
              <Ixon width="1rem">
                {pt === "new" ? <UserAddIcon /> : <UserCheckIcon />}
              </Ixon>
              <span>{getContent(patientTypeDict[pt])}</span>
            </button>
          ))}
        </div>
      </div>
      {!!config?.insurances.length && (
        <div className={classes.sidebarBlock}>
          <legend className={classes.sidebarLabel}>
            <Ixon width="1rem">
              <ShieldCheckIcon />
            </Ixon>
            <span>{getContent("insurance")}</span>
          </legend>
          <div className={classes.insuranceToggle}>
            <button
              type="button"
              onClick={() => setSelectedInsurance(null)}
              className={`${classes.insuranceToggleOption} ${
                selectedInsurance === null
                  ? classes.insuranceToggleOptionActive
                  : ""
              }`}
            >
              {getContent("selfPay")}
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedInsurance((prev) => prev ?? config.insurances[0]._id)
              }
              className={`${classes.insuranceToggleOption} ${
                selectedInsurance !== null
                  ? classes.insuranceToggleOptionActive
                  : ""
              }`}
            >
              {getContent("insuranceCoverage")}
            </button>
          </div>
          {selectedInsurance !== null && (
            <SelectInput
              className={classes.insuranceSelect}
              defaultValue={selectedInsurance}
              onChange={(e) => setSelectedInsurance(e.target.value)}
              options={Object.fromEntries(
                config.insurances.map((inc) => [
                  inc._id,
                  inc.insurance?.name || "",
                ]),
              )}
            />
          )}
        </div>
      )}
      {!!config && sessionType === "inPerson" && !!offices.length && (
        <div className={classes.sidebarBlock}>
          <legend className={classes.sidebarLabel}>
            {getContent("clinic")}
          </legend>
          <div className={classes.pillRow}>
            {offices.map((office) => (
              <button
                type="button"
                key={office._id}
                onClick={() => setSelectedClinic(office._id)}
                className={`${classes.pill} ${
                  selectedClinic === office._id ? classes.pillActive : ""
                }`}
              >
                {office.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {!!availabilities && (
        <div className={classes.sidebarBlock}>
          <legend className={classes.sidebarLabel}>
            {getContent("sessionDate")}
          </legend>
          <div className={classes.dateRow}>
            {days.map((date, index) => {
              const isActive = getSessionDateKey(selectedDay) === getSessionDateKey(date);
              const count = availableCountByDay[getSessionDateKey(date)] || 0;
              return (
                <button
                  type="button"
                  key={date.getTime()}
                  onClick={() => setSelectedDay(date)}
                  className={`${classes.dayCard} ${
                    isActive ? classes.dayCardActive : ""
                  }`}
                >
                  <span className={classes.dayCardWeekday}>
                    {index === 0
                      ? getContent("today")
                      : index === 1
                        ? getContent("tomorrow")
                        : date.toLocaleString(intlTag, { timeZone: TEHRAN_TZ, weekday: "long" })}
                  </span>
                  <span className={classes.dayCardDate}>
                    {date.toLocaleString(intlTag, {
                      timeZone: TEHRAN_TZ,
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className={classes.dayCardCount}>
                    {count.toLocaleString(intlTag)}{" "}
                    {getContent("availableSessionCount")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {!!availabilities && (
        <div className={classes.sidebarBlock}>
          <legend className={classes.sidebarLabel}>
            {getContent("sessionTime")}
          </legend>
          <TehranTimeHint ns={NS} />
          {selectedDateAvailableSessions.length ? (
            <div className={classes.timeGrid}>
              {selectedDateAvailableSessions.map((bounds) => (
                <button
                  type="button"
                  key={`${bounds[0]}-${bounds[1]}`}
                  onClick={() => setSelectedSession(bounds)}
                  className={`${classes.timeSlot} ${
                    selectedSession?.[0] === bounds[0] &&
                    selectedSession?.[1] === bounds[1]
                      ? classes.timeSlotActive
                      : ""
                  }`}
                >
                  {numberToTime(bounds[0])}
                </button>
              ))}
            </div>
          ) : (
            <p className={classes.noSessions}>
              {getContent("noSessionAvailableForSelectedPeriodMessage")}
            </p>
          )}
        </div>
      )}
      {!!price && !hidePrice && (
        <div className={classes.priceRow}>
          <span className={classes.price}>{`${currencize(price)} ${getContent(
            "toman",
          )}`}</span>
        </div>
      )}
      {!!config && (
        <Button
          className={classes.bookButton}
          radius="High"
          size="L"
          variant={selectedSession ? "Primary" : "Disable"}
          onClick={confirmReservation}
        >
          {getContent("reservation")}
        </Button>
      )}
    </div>
  );
};

export default BookingSidebar;
