"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import DateInput from "@/Components/UI/DateInput";
import ReservationStatusBadge from "@/Components/Dashboard/Booking/ReservationStatusBadge";
import { IReservation } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import { getSessionDateKey } from "@/Components/helpers/lib";
import { pickerDate, toYmd } from "@/Components/DoctorPanel/Desk/deskShared";
import { tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import schedule from "@/Components/DoctorPanel/Schedule/DoctorManageSchedulePage.module.css";
import classes from "./CenterAgendaPage.module.css";

const NS: ContentNamespace[] = [
  "common",
  "centerDoctors",
  "doctorPanelSchedule",
  "dashboardReservationStatusBadge",
];

type Person = { _id: string; firstName?: string; lastName?: string };
type Item = {
  _id: string;
  date: string;
  start: number;
  end: number;
  status: IReservation["status"];
  sessionType?: string;
  source?: string;
  doctor?: Person | null;
  patient?: { givenName?: string; lastName?: string } | null;
  user?: { phone?: string } | null;
  office?: { name?: string } | null;
};
type Agenda = { offices: number; items: Item[]; doctors: Person[] };

const fullName = (p?: Person | null) => [p?.firstName, p?.lastName].filter(Boolean).join(" ");

// The centre's agenda (2026-10): every visit at the offices its doctors
// linked to the centre, by day, filtered by doctor and date range. For the
// clinic / hospital front desk, after Doctolib's shared practice calendar.
const CenterAgendaPage = ({ kind, panel }: { kind: "clinic" | "hospital"; panel: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const [doctor, setDoctor] = useState("");
  // today and the next 14 days in Tehran (Components/helpers/tehranTime.ts)
  const [from, setFrom] = useState<string>(() => tehranTodayYmd());
  const [to, setTo] = useState<string>(() => tehranTodayYmd(14));
  useBreadCrump([
    { title: getContent("dashboard"), target: `/${panel}` },
    { title: getContent("schedule"), target: `/${panel}/booking` },
  ]);

  const query = new URLSearchParams({ from, to, ...(doctor ? { doctor } : {}) });
  const { data, error } = useSWR<Agenda>(`${API}/${kind}/reservation?${query.toString()}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const items = Array.isArray(data?.items) ? data.items : [];
  const doctors = Array.isArray(data?.doctors) ? data.doctors : [];

  const time = (m: number) => {
    const two = (n: number) => num.format(n).padStart(2, num.format(0));
    return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
  };

  const days = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const r of items) {
      if (!r?.date) continue;
      const key = getSessionDateKey(new Date(r.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(r);
    }
    const weekday = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long" });
    const date = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" });
    const today = getSessionDateKey(new Date());
    return Array.from(map.entries()).map(([key, list]) => ({
      key,
      list,
      weekday: weekday.format(tehranNoon(key)),
      date: date.format(tehranNoon(key)),
      isToday: key === today,
    }));
  }, [items, intlTag]);

  return (
    <div className={schedule.main}>
      <header className={classes.header}>
        <h1 className={schedule.title}>{getContent("schedule")}</h1>
        <div className={classes.filters}>
          <label className={classes.select}>
            <select value={doctor} onChange={(e) => setDoctor(e.target.value)} aria-label={getContent("caAllDoctors")}>
              <option value="">{getContent("caAllDoctors")}</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {fullName(d) || "—"}
                </option>
              ))}
            </select>
          </label>
          <DateInput className={classes.date} title={getContent("caFrom")} defaultValue={pickerDate(from)} onChange={(d) => setFrom(toYmd(d))} />
          <DateInput className={classes.date} title={getContent("caTo")} defaultValue={pickerDate(to)} onChange={(d) => setTo(toYmd(d))} />
        </div>
      </header>

      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            {!data.offices ? (
              <div className={schedule.empty}>{getContent("caNoOffices")}</div>
            ) : !days.length ? (
              <div className={schedule.empty}>{getContent("caEmpty")}</div>
            ) : (
              days.map((day) => (
                <section key={day.key} className={schedule.day}>
                  <div className={schedule.dayHead}>
                    <span className={`${schedule.dayName} ${day.isToday ? schedule.today : ""}`}>{day.weekday}</span>
                    <span className={schedule.dayDate}>{day.date}</span>
                    <span className={schedule.dayCount}>{getContent("schCount", [num.format(day.list.length)])}</span>
                  </div>
                  <ul className={schedule.rows}>
                    {day.list.map((r) => {
                      const patient = [r.patient?.givenName, r.patient?.lastName].filter(Boolean).join(" ") || "—";
                      return (
                        <li key={r._id} className={`${schedule.row} ${classes.row}`}>
                          <span className={schedule.time}>
                            <strong>{time(r.start)}</strong>
                            <span>{time(r.end)}</span>
                          </span>
                          <InitialAvatar name={patient} seed={r._id} />
                          <span className={schedule.who}>
                            <strong>{patient}</strong>
                            {!!r.user?.phone && <span className={schedule.phone}>{r.user.phone}</span>}
                          </span>
                          <span className={schedule.kind}>
                            {[fullName(r.doctor), r.sessionType ? getContent(r.sessionType as ContentKey) : "", r.office?.name]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                          <span className={schedule.insight}>
                            {r.source === "desk" && <span className={schedule.muted}>{getContent("deskPayAtDesk")}</span>}
                          </span>
                          <span className={schedule.status}>{r.status && <ReservationStatusBadge status={r.status} />}</span>
                          <span />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
          </>
        )}
      </HandleLoading>
    </div>
  );
};

export default CenterAgendaPage;
