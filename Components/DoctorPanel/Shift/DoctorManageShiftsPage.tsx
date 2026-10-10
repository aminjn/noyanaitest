"use client";
import useSWR from "swr";
import classes from "./DoctorManageShiftsPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IOffice, OfficePopulation } from "../Office/DoctorManageOfficesPage";
import {
  DoctorSessionType,
  PatientStatus,
} from "../Calendar/DoctorCalendarDay";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentKey } from "@/Components/Enums/contentKeys";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import DayShifts from "./DayShifts";
import { useHourAxis } from "./WeekOverview";
import useShiftUtils from "./useShiftUtils";
import Button from "@/Components/UI/Button";
import useNotification from "@/Components/Hooks/useNotification";
import TimeOffSection from "../Desk/TimeOffSection";
import HolidaySection from "../Holidays/HolidaySection";
import BookingStatusCard from "../BookingStatus/BookingStatusCard";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import BuildingIcon from "@/Components/Icons/BuildingIcon";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

export const daysOfWeekContentKeys: ContentKey[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const doctorShiftDays = [0, 1, 2, 3, 4, 5, 6] as const;
export type DoctorShiftDay = (typeof doctorShiftDays)[number];

export type DoctorShiftPopulation = Population<{
  Office: OfficePopulation;
  Doctor: DoctorProfilePopulation;
}>;

export interface IDoctorShift<
  T extends DoctorShiftPopulation = DoctorShiftPopulation,
> extends MongoDoc {
  day: DoctorShiftDay;
  start: number;
  end: number;
  office: T["Office"] extends OfficePopulation ? IOffice<T["Office"]> : string;
  duration: number;
  gap: number;
  sessionTypes: DoctorSessionType[];
  patientTypes: PatientStatus[];
  name: string;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
}

export type ShiftContext = (Omit<IDoctorShift, "office" | "doctor" | "__v"> &
  Partial<{ office: string; doctor: string }>)[];

// Each office gets one glass tone, used on its ranges and the day bars, so
// a doctor working in two places sees which hours belong where.
export const officeTones = ["tone-indigo", "tone-teal", "tone-amber", "tone-rose", "tone-sky", "tone-violet"] as const;

// What gets saved: the ranges of the days that are on, in a stable order
// (also the "has anything changed?" fingerprint).
const toPayload = (value: ShiftContext, offDays: DoctorShiftDay[]) =>
  value
    .filter((shift) => !offDays.includes(shift.day))
    .map((shift) => ({
      day: shift.day,
      start: shift.start,
      end: shift.end,
      office: shift.office || "",
      duration: shift.duration,
      gap: shift.gap,
      sessionTypes: shift.sessionTypes,
      patientTypes: shift.patientTypes,
      name: shift.name || "",
    }))
    .sort((a, b) => a.day - b.day || a.start - b.start);

// Ranges of one day that start before the previous one ends.
export const overlappingIds = (value: ShiftContext): Set<string> => {
  const out = new Set<string>();
  for (const day of doctorShiftDays) {
    const list = value.filter((s) => s.day === day).sort((a, b) => a.start - b.start);
    for (let i = 1; i < list.length; i++) {
      if (list[i].start < list[i - 1].end) {
        out.add(list[i]._id);
        out.add(list[i - 1]._id);
      }
    }
  }
  return out;
};

const Inner = ({
  defaultValue,
  offices,
  mutate,
}: {
  defaultValue: ShiftContext;
  offices: IOffice[];
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1 }), [intlTag]);
  const hasAccess = useDoctorAcl();
  const canEdit = hasAccess("mutateCalendar");
  const pushNotification = useNotification();
  const { shiftHasProblem, getShiftSessions } = useShiftUtils();

  const [value, setValue] = useState<ShiftContext>(defaultValue);
  // a day switched off keeps its ranges (greyed) until saving, so a
  // mis-tap is undone by switching it back on
  const [offDays, setOffDays] = useState<DoctorShiftDay[]>([]);
  // the last saved week (what "discard" goes back to)
  const [baseline, setBaseline] = useState<ShiftContext>(defaultValue);
  const saved = useMemo(() => JSON.stringify(toPayload(baseline, [])), [baseline]);
  const [busy, setBusy] = useState(false);

  const payload = useMemo(() => toPayload(value, offDays), [value, offDays]);
  const dirty = JSON.stringify(payload) !== saved;

  // leaving with unsaved hours asks first
  useEffect(() => {
    if (!dirty) return;
    const listener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [dirty]);

  const live = useMemo(() => value.filter((s) => !offDays.includes(s.day)), [value, offDays]);
  const overlaps = useMemo(() => overlappingIds(live), [live]);
  const axis = useHourAxis(live);

  const stats = useMemo(
    () => ({
      sessions: live.reduce((a, s) => a + getShiftSessions(s).length, 0),
      days: new Set(live.map((s) => s.day)).size,
      hours: live.reduce((a, s) => a + Math.max(0, s.end - s.start), 0) / 60,
    }),
    [live, getShiftSessions],
  );

  const toneOf = useCallback(
    (officeId?: string) => {
      const i = offices.findIndex((o) => o._id === officeId);
      return i === -1 ? "glassIcon tone-muted" : officeTones[i % officeTones.length];
    },
    [offices],
  );

  const save = useCallback(async () => {
    if (busy) return;
    if (live.some((shift) => !!shiftHasProblem(shift).length))
      return pushNotification(getContent("checkInput"), "Warn");
    if (overlaps.size) return pushNotification(getContent("shiftsOverlap"), "Warn");
    setBusy(true);
    try {
      await fetcher({ url: `${API}/doctor/shift`, method: "POST", bodyParser: "JSON", payload: { shifts: payload } });
      // the off days' ranges are gone now
      const kept = value.filter((s) => !offDays.includes(s.day));
      setValue(kept);
      setBaseline(kept);
      setOffDays([]);
      pushNotification(getContent("shSavedToast"), "Success");
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || getContent("checkInput"), "Error");
    } finally {
      setBusy(false);
    }
  }, [busy, getContent, live, mutate, offDays, overlaps.size, payload, pushNotification, shiftHasProblem, value]);

  const discard = () => {
    setValue(baseline);
    setOffDays([]);
  };

  return (
    <div className={classes.main}>
      <header className={classes.head}>
        <div className={classes.headText}>
          <h1 className={classes.title}>{getContent("shAvailTitle")}</h1>
          <p className={classes.lead}>{getContent("shPageHint")}</p>
        </div>
        <div className={classes.stats}>
          <span>{getContent("shWeekSessions", [num.format(stats.sessions)])}</span>
          <span>{getContent("shWorkDays", [num.format(stats.days)])}</span>
          <span>{getContent("shWeekHours", [num.format(stats.hours)])}</span>
        </div>
      </header>

      <BookingStatusCard />

      {!offices.length ? (
        <div className={classes.empty}>
          <span className={`glassIcon tone-indigo ${classes.emptyIcon}`}>
            <Ixon width="1.5rem">
              <BuildingIcon />
            </Ixon>
          </span>
          <div>
            <strong>{getContent("shNoOfficeTitle")}</strong>
            <p>{getContent("shNoOfficeHint")}</p>
          </div>
          <Link href="/doctorpanel/office" className={classes.emptyLink}>
            {getContent("shAddOffice")}
          </Link>
        </div>
      ) : (
        <section className={classes.week} aria-label={getContent("shWeekTitle")}>
          <div className={classes.weekHead}>
            <strong>{getContent("shWeekTitle")}</strong>
            {offices.length > 1 && (
              <ul className={classes.legend}>
                {offices.map((o) => (
                  <li key={o._id}>
                    <span className={`${classes.dot} ${toneOf(o._id)}`} />
                    {o.name || "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={classes.axisRow} aria-hidden>
            <span />
            <span className={classes.axis}>
              {axis.hours.map((h) => (
                <span key={h} style={{ insetInlineStart: axis.pct(h * 60) }}>
                  {num.format(h)}
                </span>
              ))}
            </span>
          </div>
          {doctorShiftDays.map((day) => (
            <DayShifts
              key={day}
              day={day}
              data={value}
              setData={setValue}
              offDays={offDays}
              setOffDays={setOffDays}
              offices={offices}
              overlaps={overlaps}
              axis={axis}
              toneOf={toneOf}
              canEdit={canEdit}
            />
          ))}
        </section>
      )}

      <TimeOffSection />

      <HolidaySection />

      {canEdit && !!offices.length && (
        <div className={`${classes.saveBar} ${dirty ? classes.saveBarDirty : ""}`} role="status">
          <span className={classes.saveText}>
            <span className={`${classes.saveDot} ${dirty ? classes.saveDotDirty : ""}`} />
            {dirty ? getContent("shUnsaved") : getContent("shSaved")}
          </span>
          {dirty && (
            <Button type="button" variant="Neutral" mode="Outline" size="M" onClick={discard}>
              {getContent("shDiscard")}
            </Button>
          )}
          <Button type="button" size="M" isLoading={busy} onClick={save} className={dirty ? "" : classes.saveIdle}>
            {getContent("saveAndPublish")}
          </Button>
        </div>
      )}
    </div>
  );
};

const DoctorManageShiftsPage = () => {
  const { data, error, mutate } = useSWR<IDoctorShift[]>(`${API}/doctor/shift`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  // same key as the office pages, so SWR shares the list
  const { data: officesData, error: officesError } = useSWR<IOffice[]>(`${API}/doctor/office`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("shAvailTitle"), target: "/doctorpanel/shift" },
  ]);

  const initial = useMemo<ShiftContext>(
    () =>
      (Array.isArray(data) ? data : [])
        .filter((s) => s && typeof s.start === "number" && typeof s.end === "number")
        .map((s) => ({
          ...s,
          office: typeof s.office === "string" ? s.office : (s.office as unknown as { _id?: string })?._id,
          doctor: undefined,
          name: s.name || "",
          gap: Number(s.gap) || 0,
          duration: Number(s.duration) || 20,
          sessionTypes: Array.isArray(s.sessionTypes) ? s.sessionTypes : [],
          patientTypes: Array.isArray(s.patientTypes) ? s.patientTypes : [],
        })),
    [data],
  );

  return (
    <HandleLoading data={!!data && (!!officesData || !!officesError)} error={error}>
      {!!data && (
        <Inner
          defaultValue={initial}
          offices={Array.isArray(officesData) ? officesData.filter((o) => o && o._id) : []}
          mutate={mutate}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorManageShiftsPage;
