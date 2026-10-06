"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import Link from "@/Components/i18n/Link";
import { useIntlLocale, useLocale } from "@/Components/i18n/navigation";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { CrmContext } from "../crmShared";
import { ConfirmButton, ContactField, dayOf, listOf, Ref, useCall, useCrm, useCrmText, useGet, useWhen } from "./svc";

// «تقویم تیم» (2026-10), nexxacrm's calendar: the team's events (a meeting,
// a call, an operating-room slot, a home visit) with the follow-ups and
// task due dates of the same days, six weeks at a time. An event without a
// time is all-day; times are Tehran's. Patients' appointments stay in the
// panel's own booking calendar.

const KINDS = ["meeting", "call", "surgery", "visit", "other"] as const;
type Kind = (typeof KINDS)[number];
type Event = { _id: string; title: string; kind: Kind; start: string; end?: string; allDay: boolean; done: boolean; note?: string; contact?: { _id: string; name?: string; phone: string } | null };
type Due = { _id: string; text?: string; title?: string; dueAt: string; doneAt?: string; done?: boolean; project?: string; contact?: { _id: string; name?: string } | null };
type Cal = { events: Event[]; followUps: Due[]; tasks: Due[] };
const kindKey: Record<Kind, string> = { meeting: "crmeEvMeeting", call: "crmeEvCall", surgery: "crmeEvSurgery", visit: "crmeEvVisit", other: "crmeEvOther" };

const DAY = 864e5;
const startOfWeek = (d: Date, weekStart: number) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return new Date(+x - ((x.getDay() - weekStart + 7) % 7) * DAY);
};

const EventPopup = ({ event, day, onDone }: { event?: Event; day?: Date; onDone: () => unknown }) => {
  const t = useCrmText();
  const w = useWhen();
  const call = useCall();
  const { closePopup } = usePopup();
  const [title, setTitle] = useState(event?.title || "");
  const [kind, setKind] = useState<Kind>(event?.kind || "meeting");
  const [date, setDate] = useState<Date | null>(event ? new Date(event.start) : day || new Date());
  const [time, setTime] = useState(event && !event.allDay ? w.time(event.start) : "");
  const [minutes, setMinutes] = useState(event?.end ? Math.round((+new Date(event.end) - +new Date(event.start)) / 60000) : 60);
  const [contact, setContact] = useState<Ref>(event?.contact || null);
  const [note, setNote] = useState(event?.note || "");
  const save = async () => {
    const payload = { title, kind, date: dayOf(date), time: /^\d{2}:\d{2}$/.test(time) ? time : null, minutes, contact: contact?._id || null, note: note || null };
    if (await call(event ? "PATCH" : "POST", `/calendar${event ? `/${event._id}` : ""}`, payload)) {
      closePopup("CrmeEvent");
      onDone();
    }
  };
  return (
    <PopupCard title={t(event ? "crmeEditEvent" : "crmeNewEvent")}>
      <div className={classes.popup}>
        <div className={s.stepFields}>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeEventTitle")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
          </label>
          <label className={classes.field}>
            {t("crmeEventKind")}
            <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(kindKey[k])}
                </option>
              ))}
            </select>
          </label>
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date || undefined} onChange={(d) => setDate(d)} />
          </div>
          <label className={classes.field}>
            {t("crmeTime")}
            <input type="time" dir="ltr" value={time} onChange={(e) => setTime(e.target.value)} />
            <span className={s.hint}>{t("crmeAllDayHint")}</span>
          </label>
          {!!time && (
            <label className={classes.field}>
              {t("crmeMinutes")}
              <input type="number" min={5} max={1440} step={5} dir="ltr" value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 60)} />
            </label>
          )}
          <div className={s.wideField}>
            <ContactField value={contact} onChange={setContact} label="crmeAboutPatient" />
          </div>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmNote")}
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          </label>
        </div>
        <div className={classes.actions}>
          {event && (
            <ConfirmButton onConfirm={async () => { if (await call("DELETE", `/calendar/${event._id}`)) { closePopup("CrmeEvent"); onDone(); } }}>{t("bizDelete")}</ConfirmButton>
          )}
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeEvent")}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={!title.trim() || !date} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const CrmCalendar = () => {
  const t = useCrmText();
  const w = useWhen();
  const tag = useIntlLocale();
  const locale = useLocale();
  const ctx = useCrm();
  const call = useCall();
  const { setPopup } = usePopup();
  // Saturday-first in Persian, Arabic and Urdu, Monday-first elsewhere
  const weekStart = ["fa", "ar", "ur"].includes(locale) ? 6 : 1;
  const [anchor, setAnchor] = useState(() => new Date());
  const first = useMemo(() => startOfWeek(anchor, weekStart), [anchor, weekStart]);
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => new Date(+first + i * DAY + 12 * 36e5)), [first]);
  const last = new Date(+first + 42 * DAY);
  const { data, error, mutate } = useGet<Cal | null>(`/calendar?from=${first.toISOString()}&to=${last.toISOString()}`, (d) => (d && typeof d === "object" ? (d as Cal) : null));
  const fmt = useMemo(
    () => ({
      day: new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, day: "numeric" }),
      // the day of the month in Latin digits (is it the 1st?)
      dayLatn: new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, day: "numeric", numberingSystem: "latn" }),
      dayMonth: new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, day: "numeric", month: "short" }),
      weekday: new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, weekday: "short" }),
      range: new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, year: "numeric", month: "long" }),
    }),
    [tag],
  );
  const monthOf = (d: Date) => new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, month: "numeric" }).format(d);
  const anchorMonth = monthOf(anchor);
  const sameDay = (a: string | Date, b: Date) => dayOf(a) === dayOf(b);
  const today = new Date();
  const wrap = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const open = (event?: Event, day?: Date) => setPopup("CrmeEvent", wrap(<EventPopup event={event} day={day} onDone={() => mutate()} />));
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={s.row}>
          <button type="button" className={classes.ghost} onClick={() => setAnchor((a) => new Date(+a - 28 * DAY))} aria-label={t("crmePrev")}>
            {t("crmePrev")}
          </button>
          <button type="button" className={classes.ghost} onClick={() => setAnchor(new Date())}>
            {t("crmeToday")}
          </button>
          <button type="button" className={classes.ghost} onClick={() => setAnchor((a) => new Date(+a + 28 * DAY))} aria-label={t("crmeNext")}>
            {t("crmeNext")}
          </button>
          <span className={s.strong}>{fmt.range.format(anchor)}</span>
        </div>
        <button type="button" className={classes.primary} onClick={() => open()}>
          {t("crmeNewEvent")}
        </button>
      </div>
      <div className={s.weekdays}>
        {days.slice(0, 7).map((d) => (
          <span key={+d}>{fmt.weekday.format(d)}</span>
        ))}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={s.month}>
          {days.map((d) => {
            const evs = listOf<Event>(data?.events).filter((e) => sameDay(e.start, d));
            const fus = listOf<Due>(data?.followUps).filter((e) => sameDay(e.dueAt, d));
            const tks = listOf<Due>(data?.tasks).filter((e) => sameDay(e.dueAt, d));
            return (
              <div key={+d} className={`${s.day} ${monthOf(d) !== anchorMonth ? s.dayOff : ""} ${sameDay(today, d) ? s.dayToday : ""}`}>
                <button type="button" className={s.dayNum} onClick={() => open(undefined, d)} aria-label={t("crmeNewEventOn", [fmt.dayMonth.format(d)])}>
                  {fmt.dayLatn.format(d) === "1" ? fmt.dayMonth.format(d) : fmt.day.format(d)}
                </button>
                {evs.map((e) => (
                  <span key={e._id} className={s.row}>
                    <input
                      type="checkbox"
                      checked={e.done}
                      aria-label={t("crmMarkDone")}
                      onChange={async () => (await call("POST", `/calendar/${e._id}/toggle`, undefined, false)) && mutate()}
                    />
                    <button type="button" className={`${s.chipEvent} ${e.done ? s.chipDone : ""}`} onClick={() => open(e)} title={e.title}>
                      {e.allDay ? "" : `${w.time(e.start)} `}
                      {e.title}
                    </button>
                  </span>
                ))}
                {fus.map((e) => (
                  <Link key={e._id} href={e.contact ? `${ctx.panel}/crm/contacts/${e.contact._id}` : `${ctx.panel}/crm/followups`} className={`${s.chipFollow} ${e.doneAt ? s.chipDone : ""}`} title={e.text}>
                    {e.text}
                  </Link>
                ))}
                {tks.map((e) => (
                  <Link key={e._id} href={`${ctx.panel}/crm/tasks/${e.project}`} className={`${s.chipTask} ${e.done ? s.chipDone : ""}`} title={e.title}>
                    {e.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </HandleLoading>
      <div className={s.row}>
        <span className={`${s.chipEvent} ${s.legend}`}>
          {t("crmeLegendEvent")}
        </span>
        <span className={`${s.chipFollow} ${s.legend}`}>
          {t("crmeLegendFollowUp")}
        </span>
        <span className={`${s.chipTask} ${s.legend}`}>
          {t("crmeLegendTask")}
        </span>
        <span className={crm.subText}>{t("crmeCalHint")}</span>
      </div>
    </section>
  );
};

export default CrmCalendar;
