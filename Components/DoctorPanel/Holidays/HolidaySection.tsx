"use client";
import { useMemo, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { TEHRAN_TZ, tehranNoon } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ToggleInput from "@/Components/UI/ToggleInput";
import Link from "@/Components/i18n/Link";
import useDoctorHolidays, { DoctorHolidays } from "./useDoctorHolidays";
import HolidayCalendar from "./HolidayCalendar";
import classes from "./HolidaySection.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// «تعطیلات رسمی» on the hours page (2026-10): Iran's official holidays of
// the booking horizon, each with «تعطیلم / ویزیت دارم», a global switch,
// and the visits already booked on a holiday (never cancelled for it; the
// doctor moves them). Doctolib Pro closes public holidays by default and
// lets the practice open one; Paziresh24 / Nobat only show the calendar.
const HolidaySection = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const hasAccess = useDoctorAcl();
  const canEdit = hasAccess("mutateCalendar");
  const pushNotification = useNotification();
  const { data, mutate } = useDoctorHolidays();
  const [busy, setBusy] = useState<string | null>(null);
  // the calendar's month and the holiday tapped on it
  const [month, setMonth] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const fmt = useMemo(
    () => ({
      day: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric" }),
      month: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, month: "short" }),
      long: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" }),
      full: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" }),
    }),
    [intlTag],
  );
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);

  const save = async (key: string, url: string, payload: Record<string, unknown>, optimistic: (d: DoctorHolidays) => DoctorHolidays) => {
    if (busy) return;
    setBusy(key);
    try {
      if (data) mutate(optimistic(data), { revalidate: false });
      await fetcher({ url, method: "POST", bodyParser: "JSON", payload });
      pushNotification(getContent("holSaved"), "Success");
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(null);
      mutate();
    }
  };

  const setWorks = (works: boolean) =>
    save("works", `${API}/doctor/holidays/policy`, { works }, (d) => ({
      ...d,
      works,
      holidays: d.holidays.map((h) => ({ ...h, closed: !works })),
    }));

  const setDay = (ymd: string, open: boolean) =>
    save(ymd, `${API}/doctor/holidays/day`, { ymd, open }, (d) => ({
      ...d,
      holidays: d.holidays.map((h) => (h.ymd === ymd ? { ...h, closed: !open } : h)),
    }));

  if (!data) return null;
  const list = data.holidays;

  return (
    <section className={classes.section} id="holidays" aria-labelledby="holidays-title">
      <div className={classes.head}>
        <span id="holidays-title" className={classes.title}>
          {getContent("holTitle")}
        </span>
        <ToggleInput
          title={getContent("holWorksSwitch")}
          value={data.works}
          readOnly={!canEdit || busy === "works"}
          onChange={() => setWorks(!data.works)}
        />
      </div>
      <p className={classes.hint}>
        {getContent("holHint")} {getContent("holWorksSwitchHint")}
      </p>
      <HolidayCalendar
        holidays={list}
        month={month}
        onMonth={(i) => {
          setMonth(i);
          setPicked(null);
        }}
        onPick={(ymd) => {
          setPicked(ymd);
          document.getElementById(`hol-${ymd}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }}
      >
        {(days) =>
          list.some((h) => days.has(h.ymd)) ? (
            <ul className={classes.list}>
          {list.filter((h) => days.has(h.ymd)).map((h) => {
            const at = tehranNoon(h.ymd);
            return (
              <li key={h.ymd} id={`hol-${h.ymd}`}
                className={`${classes.item} ${h.closed ? classes.itemClosed : classes.itemOpen} ${picked === h.ymd ? classes.itemPicked : ""}`}>
                <span className={classes.date} aria-hidden>
                  <b>{fmt.day.format(at)}</b>
                  <small>{fmt.month.format(at)}</small>
                </span>
                <span className={classes.text}>
                  <strong>{h.title || "—"}</strong>
                  <small>{fmt.long.format(at)}</small>
                  {h.booked > 0 && (
                    <span className={h.closed ? classes.booked : classes.bookedOk}>
                      {getContent("holBooked", [num.format(h.booked)])}
                      {h.closed && <> · {getContent("holBookedHint")} </>}
                      <Link href="/doctorpanel/schedule" className={classes.link}>
                        {getContent("holSeeVisits")}
                      </Link>
                    </span>
                  )}
                </span>
                <span className={classes.choice} role="radiogroup" aria-label={`${h.title} · ${fmt.long.format(at)}`}>
                  {[true, false].map((closed) => (
                    <button
                      key={String(closed)}
                      type="button"
                      role="radio"
                      aria-checked={h.closed === closed}
                      disabled={!canEdit || busy === h.ymd}
                      className={`${classes.opt} ${h.closed === closed ? (closed ? classes.optClosed : classes.optOpen) : ""}`}
                      onClick={() => h.closed !== closed && setDay(h.ymd, !closed)}
                    >
                      {getContent(closed ? "holClosed" : "holOpen")}
                    </button>
                  ))}
                </span>
              </li>
            );
          })}
            </ul>
          ) : (
            <p className={classes.muted}>{getContent("holCalNoneHint")}</p>
          )
        }
      </HolidayCalendar>
      {!list.length && (
        <div className={classes.empty}>
          <p>{getContent("holEmpty", [data.horizonEnd ? fmt.full.format(tehranNoon(data.horizonEnd)) : "—"])}</p>
          {!!data.next && (
            <p className={classes.muted}>{getContent("holNext", [fmt.long.format(tehranNoon(data.next.ymd)), data.next.title])}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default HolidaySection;
