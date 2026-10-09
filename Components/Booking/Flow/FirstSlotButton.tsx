"use client";
import { useMemo, useState } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useProgress from "@/Components/Hooks/useProgress";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { DoctorSessionType, doctorSessionTypeContentKeyDict } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { diffDaysYmd, isYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import BookingSessionSelectorPopup from "../BookingSessionSelectorPopup";
import { clock, finalizeHref } from "./bookingFlow";
import classes from "./FirstSlotButton.module.css";

const NS: ContentNamespace[] = ["common", "uiDoctorCard", "bookingFlow"];

type SlotTime = { start: number; end: number; office?: string };

// the next free slot the list endpoints send per doctor (backend
// Lib/nextSlot.ts): Tehran day, minutes, the office and visit type, and the
// first free times of that day
export type NextSlot = SlotTime & { ymd: string; sessionType: DoctorSessionType; times?: SlotTime[] };

const isTime = (t: unknown): t is SlotTime =>
  !!t && typeof (t as SlotTime).start === "number" && typeof (t as SlotTime).end === "number";

export const nextSlotOf = (node: unknown): NextSlot | null => {
  const s = (node as { nextSlot?: Partial<NextSlot> | null } | null)?.nextSlot;
  return s && isYmd(s.ymd) && typeof s.start === "number" && typeof s.end === "number" && !!s.sessionType
    ? ({ ...s, times: Array.isArray(s.times) ? s.times.filter(isTime) : [] } as NextSlot)
    : null;
};

// The booking block of a doctor card (Doctolib / Paziresh24): the first
// free day and its real times. A time goes straight to the details step;
// «همه‌ی زمان‌ها» opens the quick picker on that day. A bookable doctor with
// nothing free in the horizon offers «خبرم کن» (the picker's waitlist).
const FirstSlotButton = ({ node, slot }: { node: IDoctorProfile; slot: NextSlot | null }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const push = useProgress();
  const [open, setOpen] = useState(false);
  const sheet = open && (
    <BookingSessionSelectorPopup
      node={node}
      open
      onClose={() => setOpen(false)}
      initialType={slot?.sessionType}
      initialDate={slot ? tehranNoon(slot.ymd) : undefined}
    />
  );

  if (!slot)
    return (
      <div className={classes.none}>
        <span>{getContent("dcNoFreeSoon")}</span>
        <button type="button" className={classes.link} onClick={() => setOpen(true)}>
          {getContent("bfWlCta")}
        </button>
        {sheet}
      </div>
    );

  const diff = diffDaysYmd(tehranTodayYmd(), slot.ymd);
  const date = tehranNoon(slot.ymd).toLocaleDateString(intlTag, {
    timeZone: TEHRAN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dayText =
    diff === 0
      ? getContent("bfDayAndDate", [getContent("today"), date])
      : diff === 1
        ? getContent("bfDayAndDate", [getContent("tomorrow"), date])
        : date;
  const times = slot.times?.length ? slot.times : [slot];

  return (
    <div className={classes.box}>
      <div className={classes.head}>
        <span className={classes.dot} aria-hidden />
        <span className={classes.day}>{dayText}</span>
        <span className={classes.type}>{getContent(doctorSessionTypeContentKeyDict[slot.sessionType])}</span>
      </div>
      <div className={classes.times}>
        {times.map((t) => (
          <button
            key={t.start}
            type="button"
            className={classes.time}
            onClick={() =>
              push(
                finalizeHref(node._id, {
                  ymd: slot.ymd,
                  start: t.start,
                  end: t.end,
                  office: t.office || slot.office || null,
                  sessionType: slot.sessionType,
                }),
              )
            }
          >
            {clock(t.start, nf)}
          </button>
        ))}
        <button type="button" className={`${classes.time} ${classes.all}`} onClick={() => setOpen(true)}>
          {getContent("dcAllTimes")}
        </button>
      </div>
      {sheet}
    </div>
  );
};

export default FirstSlotButton;
