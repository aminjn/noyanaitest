"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import DateInput from "@/Components/UI/DateInput";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { toYmd } from "./deskShared";
import classes from "./Desk.module.css";
import { numberToTime } from "../Calendar/AddSessionsAgent";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

type TimeOff = { _id: string; from: string; to: string; note?: string; startMin?: number; endMin?: number };

// every quarter hour of the day for the "a few hours" mode
const quarterHours = Array.from({ length: 97 }, (_, i) => i * 15);

// Days off on the shifts page (2026-10): leave, travel, holidays. No slot
// is offered on them; visits already booked are counted so the desk can
// move them.
const TimeOffSection = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const hasAccess = useDoctorAcl();
  const canEdit = hasAccess("mutateCalendar");
  const pushNotification = useNotification();
  const { data, mutate } = useSWR<TimeOff[]>(`${API}/doctor/timeoff`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [note, setNote] = useState("");
  // the whole day, or only some hours of it (a meeting, an operation)
  const [hours, setHours] = useState(false);
  const [startMin, setStartMin] = useState(12 * 60);
  const [endMin, setEndMin] = useState(14 * 60);
  const [busy, setBusy] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" }),
    [intlTag],
  );
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);

  const add = async () => {
    if (!from) return pushNotification(getContent("timeOffFrom"), "Error");
    if (hours && endMin <= startMin) return pushNotification(getContent("shiftStartMustBeBeforeEnd"), "Warn");
    setBusy(true);
    try {
      const res = (await fetcher({
        url: `${API}/doctor/timeoff`,
        method: "POST",
        bodyParser: "JSON",
        payload: {
          from,
          to: to || from,
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(hours ? { startMin, endMin } : {}),
        },
      })) as { data?: { booked?: number } };
      const booked = Number(res?.data?.booked) || 0;
      if (booked) pushNotification(getContent("timeOffBooked", [num.format(booked)]), "Notify");
      setFrom(null);
      setTo(null);
      setNote("");
      setFormKey((k) => k + 1);
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await fetcher({ url: `${API}/doctor/timeoff/${id}`, method: "DELETE" });
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    }
  };

  const list = Array.isArray(data) ? data : [];

  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <span className={classes.sectionTitle}>{getContent("timeOffTitle")}</span>
      </div>
      <p className={classes.hint}>{getContent("timeOffHint")}</p>
      {canEdit && (
        <div className={classes.chips} role="radiogroup" aria-label={getContent("timeOffTitle")}>
          {[false, true].map((h) => (
            <button
              key={String(h)}
              type="button"
              role="radio"
              aria-checked={hours === h}
              className={`${classes.chip} ${hours === h ? classes.chipOn : ""}`}
              onClick={() => setHours(h)}
            >
              {getContent(h ? "timeOffHours" : "timeOffWholeDay")}
            </button>
          ))}
        </div>
      )}
      {canEdit && (
        <div key={formKey} className={classes.grid}>
          <DateInput title={getContent("timeOffFrom")} onChange={(d) => setFrom(toYmd(d))} />
          <DateInput title={getContent("timeOffTo")} onChange={(d) => setTo(toYmd(d))} />
          {hours && (
            <div className={classes.timeRange}>
              <label>
                <span>{getContent("startTime")}</span>
                <select value={startMin} onChange={(e) => setStartMin(Number(e.target.value))}>
                  {quarterHours.slice(0, -1).map((m) => (
                    <option key={m} value={m}>
                      {numberToTime(m)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{getContent("endTime")}</span>
                <select value={endMin} onChange={(e) => setEndMin(Number(e.target.value))}>
                  {quarterHours.slice(1).map((m) => (
                    <option key={m} value={m}>
                      {numberToTime(m)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <Input title={getContent("timeOffNote")} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
      {canEdit && (
        <div className={classes.actions}>
          <Button onClick={add} isLoading={busy}>
            {getContent("timeOffAdd")}
          </Button>
        </div>
      )}
      {!list.length ? (
        <p className={classes.muted}>{getContent("timeOffEmpty")}</p>
      ) : (
        <ul className={classes.offList}>
          {list.map((t) => {
            const a = new Date(t.from);
            const b = new Date(t.to);
            const same = isNaN(b.getTime()) || a.getTime() === b.getTime();
            const partial = typeof t.startMin === "number" && typeof t.endMin === "number";
            return (
              <li key={t._id} className={classes.offItem}>
                <span className={classes.offDates}>
                  {isNaN(a.getTime()) ? "—" : same ? fmt.format(a) : `${fmt.format(a)} – ${fmt.format(b)}`}
                </span>
                <span className={classes.offHours}>
                  {partial
                    ? `${numberToTime(t.startMin as number)}–${numberToTime(t.endMin as number)}`
                    : getContent("timeOffWholeDay")}
                </span>
                <span className={classes.offNote}>{t.note || ""}</span>
                {canEdit && (
                  <IconButton variant="Danger" onClick={() => remove(t._id)} title={getContent("timeOffRemove")}>
                    <GarbageIcon />
                  </IconButton>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default TimeOffSection;
