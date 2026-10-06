"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import DateInput from "@/Components/UI/DateInput";
import { DeskSlot, PickedSlot, toYmd } from "./deskShared";
import classes from "./Desk.module.css";

// A day, then one of the doctor's free sessions that day (taken and past
// ones shown greyed out), from GET /doctor/desk/slots.
const SlotPicker = ({
  ns,
  sessionType,
  except,
  value,
  onChange,
}: {
  ns: ContentNamespace[];
  sessionType?: string;
  except?: string;
  value: PickedSlot | null;
  onChange: (slot: PickedSlot | null) => unknown;
}) => {
  const getContent = useScopedLocale(ns);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  // opens on today (most desk bookings are for today or tomorrow)
  const [day, setDay] = useState<string | null>(value?.date || toYmd(new Date()));
  const [pickerKey, setPickerKey] = useState(0);
  const quickDays = [0, 1].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return { ymd: toYmd(d), label: getContent(offset ? "deskTomorrow" : "deskToday") };
  });

  const query = new URLSearchParams();
  if (day) query.set("date", day);
  if (sessionType) query.set("sessionType", sessionType);
  if (except) query.set("except", except);
  const { data, isLoading } = useSWR<{ dayOff: boolean; slots: DeskSlot[] }>(
    day ? `${API}/doctor/desk/slots?${query.toString()}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const slots = Array.isArray(data?.slots) ? data.slots : [];
  const free = slots.filter((s) => !s.taken && !s.past);

  const time = (m: number) => {
    const two = (n: number) => num.format(n).padStart(2, num.format(0));
    return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
  };

  return (
    <div className={classes.slotPicker}>
      <div className={classes.chips}>
        {quickDays.map((q) => (
          <button
            key={q.ymd}
            type="button"
            className={`${classes.chip} ${day === q.ymd ? classes.chipOn : ""}`}
            aria-pressed={day === q.ymd}
            onClick={() => {
              setDay(q.ymd);
              setPickerKey((k) => k + 1);
              onChange(null);
            }}
          >
            {q.label}
          </button>
        ))}
      </div>
      <DateInput
        key={pickerKey}
        title={getContent("deskDay")}
        defaultValue={day ? new Date(`${day}T00:00:00`) : undefined}
        onChange={(d) => {
          setDay(toYmd(d));
          onChange(null);
        }}
      />
      {!day ? (
        <p className={classes.muted}>{getContent("deskPickDay")}</p>
      ) : isLoading ? (
        <p className={classes.muted}>…</p>
      ) : data?.dayOff ? (
        <p className={classes.warn}>{getContent("deskDayOff")}</p>
      ) : !free.length ? (
        <p className={classes.warn}>{getContent("deskNoSlots")}</p>
      ) : (
        <>
          <span className={classes.label}>{getContent("deskPickSlot")}</span>
          <div className={classes.slots} role="listbox">
            {/* past sessions of today are left out, taken ones greyed */}
            {slots.filter((s) => !s.past).map((s) => {
              const on = !!value && value.date === day && value.start === s.start && value.end === s.end;
              const disabled = s.taken || s.past;
              return (
                <button
                  key={`${s.start}-${s.end}-${s.office?._id || ""}`}
                  type="button"
                  role="option"
                  aria-selected={on}
                  disabled={disabled}
                  className={`${classes.slot} ${on ? classes.slotOn : ""}`}
                  title={s.office?.name || undefined}
                  onClick={() => onChange({ date: day, start: s.start, end: s.end })}
                >
                  {time(s.start)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SlotPicker;
