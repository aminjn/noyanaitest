"use client";
import { useMemo, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { tehranNoon, TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Link from "@/Components/i18n/Link";
import Button from "@/Components/UI/Button";
import ReservationStatusBadge from "@/Components/Dashboard/Booking/ReservationStatusBadge";
import { ReservationStatus, reservationStatuses } from "@/Components/Dashboard/Booking/reservationStatus";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import { daysOfWeekContentKeys, DoctorShiftDay, ShiftContext } from "./DoctorManageShiftsPage";
import { HoursDay } from "./useHoursSummary";
import classes from "./HoursDayPanel.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

const knownTypes = ["inPerson", "textChat", "sipCall", "voiceCall", "videoCall"];
// every quarter hour of the day for "block some hours"
const quarterHours = Array.from({ length: 97 }, (_, i) => i * 15);

// One day of the calendar (2026-10): its visits with the way to each, its
// hours from the weekly template, and what can be done that day - the
// holiday's «تعطیلم / ویزیت دارم», close the day or some hours of it,
// take a day off back - plus the way to the full agenda. Doctolib Pro opens
// the same from its calendar: the day's appointments, opening hours and
// absences in one place.
const HoursDayPanel = ({
  ymd,
  day,
  today,
  horizonEnd,
  canSeeVisits,
  canEdit,
  shifts,
  offices,
  toneOf,
  onChanged,
  onEditWeekday,
}: {
  ymd: string;
  day?: HoursDay;
  today: string;
  horizonEnd: string | null;
  canSeeVisits: boolean;
  canEdit: boolean;
  shifts: ShiftContext;
  offices: IOffice[];
  toneOf: (officeId?: string) => string;
  onChanged: () => unknown;
  onEditWeekday: (day: DoctorShiftDay) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState<string | null>(null);
  const [hoursForm, setHoursForm] = useState(false);
  const [startMin, setStartMin] = useState(12 * 60);
  const [endMin, setEndMin] = useState(14 * 60);
  const fmt = useMemo(
    () => ({
      num: new Intl.NumberFormat(intlTag),
      short: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "short" }),
    }),
    [intlTag],
  );
  // 09:30 in the reader's digits
  const time = (m: number) => {
    const two = (v: number) => fmt.num.format(v).padStart(2, fmt.num.format(0));
    return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
  };

  const weekday = ((tehranNoon(ymd).getUTCDay() + 1) % 7) as DoctorShiftDay;
  const past = ymd < today;
  const ranges = useMemo(
    () => shifts.filter((s) => s.day === weekday).sort((a, b) => a.start - b.start),
    [shifts, weekday],
  );
  const officeOf = (id?: string | null) => offices.find((o) => o._id === id);
  const visits = day?.visits || [];
  const timeOff = day?.timeOff || [];
  const wholeOff = timeOff.some((t) => typeof t.startMin !== "number");

  const run = async (key: string, call: () => Promise<unknown>, done?: (res: unknown) => void) => {
    if (busy) return;
    setBusy(key);
    try {
      const res = await call();
      done?.(res);
      await onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(null);
    }
  };

  const setHoliday = (open: boolean) =>
    run("hol", () => fetcher({ url: `${API}/doctor/holidays/day`, method: "POST", bodyParser: "JSON", payload: { ymd, open } }), () =>
      pushNotification(getContent("holSaved"), "Success"),
    );

  const closeDay = (partial: boolean) => {
    if (partial && endMin <= startMin) return pushNotification(getContent("shiftStartMustBeBeforeEnd"), "Warn");
    return run(
      partial ? "hours" : "day",
      () =>
        fetcher({
          url: `${API}/doctor/timeoff`,
          method: "POST",
          bodyParser: "JSON",
          payload: { from: ymd, to: ymd, ...(partial ? { startMin, endMin } : {}) },
        }),
      (res) => {
        const booked = Number((res as { data?: { booked?: number } })?.data?.booked) || 0;
        pushNotification(getContent("hcClosedToast"), "Success");
        if (booked) pushNotification(getContent("timeOffBooked", [fmt.num.format(booked)]), "Notify");
        setHoursForm(false);
      },
    );
  };

  const removeTimeOff = (id: string) =>
    run(`t${id}`, () => fetcher({ url: `${API}/doctor/timeoff/${id}`, method: "DELETE" }), () =>
      pushNotification(getContent("hcTimeOffRemoved"), "Success"),
    );

  const typeLabel = (t: string) => (knownTypes.includes(t) ? getContent(t as ContentKey) : t === "phone" ? getContent("phoneConsult") : "");

  return (
    <div className={classes.panel}>
      {/* the day at a glance */}
      <div className={classes.facts}>
        {!!day?.holiday && (
          <span className={`${classes.fact} ${day.holiday.closed ? classes.factHol : classes.factOpen}`}>
            {getContent("holDayLabel", [day.holiday.title])}
            {day.holiday.estimated && <small> · {getContent("hcEstimated")}</small>}
          </span>
        )}
        {!!day && !day.working && !day.holiday && <span className={classes.fact}>{getContent("offDay")}</span>}
        {wholeOff && <span className={`${classes.fact} ${classes.factOff}`}>{getContent("hcLegendTimeOff")}</span>}
        {!!day && day.slots > 0 && (
          <span className={classes.fact}>
            {day.free !== null
              ? getContent("hcFreeOf", [fmt.num.format(day.free), fmt.num.format(day.slots)])
              : getContent("xSessions", [fmt.num.format(day.slots)])}
          </span>
        )}
        {!!day && day.free === null && !past && !!horizonEnd && ymd > horizonEnd && day.working && (
          <span className={classes.fact}>{getContent("hcBeyondHorizon")}</span>
        )}
      </div>

      {/* official holiday: the doctor's choice for the day */}
      {!!day?.holiday && !past && canEdit && (
        <div className={classes.block}>
          <div className={classes.choice} role="radiogroup" aria-label={day.holiday.title}>
            {[true, false].map((closed) => (
              <button
                key={String(closed)}
                type="button"
                role="radio"
                aria-checked={day.holiday?.closed === closed}
                disabled={busy === "hol"}
                className={`${classes.opt} ${day.holiday?.closed === closed ? (closed ? classes.optClosed : classes.optOpen) : ""}`}
                onClick={() => day.holiday?.closed !== closed && setHoliday(!closed)}
              >
                {getContent(closed ? "holClosed" : "holOpen")}
              </button>
            ))}
          </div>
          {day.holiday.closed && day.booked > 0 && <p className={classes.warn}>{getContent("holBookedHint")}</p>}
        </div>
      )}

      {/* the visits of the day */}
      <section className={classes.block} aria-label={getContent("hcDayVisits")}>
        <div className={classes.blockHead}>
          <strong>{getContent("hcDayVisits")}</strong>
          {!!day && day.booked > 0 && <span className={classes.count}>{fmt.num.format(day.booked)}</span>}
        </div>
        {!canSeeVisits ? (
          <p className={classes.muted}>{day?.booked ? getContent("xSessions", [fmt.num.format(day.booked)]) : getContent("hcNoVisits")}</p>
        ) : !visits.length ? (
          <p className={classes.muted}>{getContent("hcNoVisits")}</p>
        ) : (
          <ul className={classes.visits}>
            {visits.map((v) => {
              const office = v.sessionType === "inPerson" ? officeOf(v.office) : undefined;
              return (
                <li key={v._id}>
                  <Link href={`/doctorpanel/booking/${v._id}`} className={classes.visit}>
                    <span className={classes.visitTime} dir="ltr">
                      {time(v.start)}
                    </span>
                    <span className={classes.visitMain}>
                      <strong>{v.patient || "—"}</strong>
                      <small>
                        {[typeLabel(v.sessionType), office?.name].filter(Boolean).join(" · ")}
                      </small>
                    </span>
                    {reservationStatuses.includes(v.status as ReservationStatus) && (
                      <ReservationStatusBadge status={v.status as ReservationStatus} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* the day's hours from the weekly template */}
      <section className={classes.block} aria-label={getContent("hcDayHours")}>
        <div className={classes.blockHead}>
          <strong>{getContent("hcDayHours")}</strong>
          {canEdit && (
            <button type="button" className={classes.linkBtn} onClick={() => onEditWeekday(weekday)}>
              {getContent("hcEditWeekday", [getContent(daysOfWeekContentKeys[weekday])])}
            </button>
          )}
        </div>
        {!ranges.length ? (
          <p className={classes.muted}>{getContent("hcNoHours")}</p>
        ) : (
          <ul className={classes.ranges}>
            {ranges.map((r) => {
              const office = officeOf(r.office);
              return (
                <li key={r._id} className={classes.range}>
                  <span className={`${classes.dot} ${toneOf(r.office)}`} aria-hidden />
                  <span className={classes.rangeOffice}>{office?.name || getContent("office")}</span>
                  <span dir="ltr" className={classes.rangeTime}>
                    {time(r.start)}–{time(r.end)}
                  </span>
                  <span className={classes.muted}>{getContent("xMinutes", [fmt.num.format(r.duration)])}</span>
                  {office?.active === false && <span className={classes.inactive}>{getContent("inactive")}</span>}
                  {timeOff
                    .filter((t) => typeof t.startMin === "number" && typeof t.endMin === "number")
                    .some((t) => !((t.endMin as number) <= r.start || (t.startMin as number) >= r.end)) && (
                    <span className={classes.inactive}>{getContent("hcSomeHoursOff")}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* days off and blocked hours on this day */}
      {(!!timeOff.length || (!past && canEdit)) && (
        <section className={classes.block} aria-label={getContent("timeOffTitle")}>
          <div className={classes.blockHead}>
            <strong>{getContent("timeOffTitle")}</strong>
          </div>
          {!!timeOff.length && (
            <ul className={classes.offs}>
              {timeOff.map((t) => {
                const partial = typeof t.startMin === "number" && typeof t.endMin === "number";
                const multi = t.from !== t.to;
                return (
                  <li key={t._id} className={classes.off}>
                    <span className={classes.offText}>
                      <strong>
                        {partial ? (
                          <span dir="ltr">
                            {time(t.startMin as number)}–{time(t.endMin as number)}
                          </span>
                        ) : (
                          getContent("timeOffWholeDay")
                        )}
                      </strong>
                      {multi && (
                        <small>
                          {getContent("hcRemoveRange", [fmt.short.format(tehranNoon(t.from)), fmt.short.format(tehranNoon(t.to))])}
                        </small>
                      )}
                      {!!t.note && <small>{t.note}</small>}
                    </span>
                    {canEdit && t.to >= today && (
                      <Button
                        type="button"
                        size="S"
                        variant="Error"
                        mode="Outline"
                        isLoading={busy === `t${t._id}`}
                        onClick={() => removeTimeOff(t._id)}
                      >
                        {getContent("hcRemoveTimeOff")}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!past && canEdit && !wholeOff && (
            <>
              <div className={classes.actions}>
                <Button type="button" size="S" variant="Neutral" mode="Outline" isLoading={busy === "day"} onClick={() => closeDay(false)}>
                  {getContent("hcCloseDay")}
                </Button>
                <Button
                  type="button"
                  size="S"
                  variant="Neutral"
                  mode="Outline"
                  aria-expanded={hoursForm}
                  onClick={() => setHoursForm((v) => !v)}
                >
                  {getContent("hcCloseHours")}
                </Button>
              </div>
              {hoursForm && (
                <div className={classes.hoursForm}>
                  <label>
                    <span>{getContent("startTime")}</span>
                    <select value={startMin} onChange={(e) => setStartMin(Number(e.target.value))}>
                      {quarterHours.slice(0, -1).map((m) => (
                        <option key={m} value={m}>
                          {time(m)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{getContent("endTime")}</span>
                    <select value={endMin} onChange={(e) => setEndMin(Number(e.target.value))}>
                      {quarterHours.slice(1).map((m) => (
                        <option key={m} value={m}>
                          {time(m)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="button" size="S" isLoading={busy === "hours"} onClick={() => closeDay(true)}>
                    {getContent("hcCloseSave")}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      <Link href="/doctorpanel/schedule" className={classes.fullLink}>
        {getContent("hcFullSchedule")}
      </Link>
    </div>
  );
};

export default HoursDayPanel;
