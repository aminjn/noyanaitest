"use client";
import { useMemo, useState } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { DoctorSessionType, doctorSessionTypeContentKeyDict } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { diffDaysYmd, isYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import Ixon from "@/Components/UI/Ixon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import BookingSessionSelectorPopup from "../BookingSessionSelectorPopup";
import { clock } from "./bookingFlow";
import classes from "./FirstSlotButton.module.css";

const NS: ContentNamespace[] = ["common", "uiDoctorCard", "bookingFlow"];

// the next free slot the list endpoints send per doctor (backend
// Lib/nextSlot.ts): Tehran day, minutes, the office and visit type
export type NextSlot = { ymd: string; start: number; end: number; office?: string; sessionType: DoctorSessionType };

export const nextSlotOf = (node: unknown): NextSlot | null => {
  const s = (node as { nextSlot?: Partial<NextSlot> | null } | null)?.nextSlot;
  return s && isYmd(s.ymd) && typeof s.start === "number" && typeof s.end === "number" && !!s.sessionType
    ? (s as NextSlot)
    : null;
};

// «اولین نوبت: فردا ۱۰:۲۰» on a doctor card (Zocdoc / Doctolib "next
// available"): one tap opens the quick picker on that very slot.
const FirstSlotButton = ({ node, slot }: { node: IDoctorProfile; slot: NextSlot }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const [open, setOpen] = useState(false);
  const today = tehranTodayYmd();
  const diff = diffDaysYmd(today, slot.ymd);
  const dayText =
    diff === 0
      ? getContent("today")
      : diff === 1
        ? getContent("tomorrow")
        : tehranNoon(slot.ymd).toLocaleDateString(intlTag, { timeZone: TEHRAN_TZ, weekday: "short", day: "numeric", month: "long" });
  return (
    <>
      <button
        type="button"
        className={classes.btn}
        onClick={() => setOpen(true)}
        title={getContent(doctorSessionTypeContentKeyDict[slot.sessionType])}
      >
        <span className={`${classes.icon} tone-teal`}>
          <Ixon width="0.9rem">
            <ClockIcon />
          </Ixon>
        </span>
        <span className={classes.text}>{getContent("dcFirstSlot", [dayText, clock(slot.start, nf)])}</span>
        <span className={classes.type}>{getContent(doctorSessionTypeContentKeyDict[slot.sessionType])}</span>
      </button>
      {open && (
        <BookingSessionSelectorPopup
          node={node}
          open
          onClose={() => setOpen(false)}
          initialType={slot.sessionType}
          initialPick={{ ymd: slot.ymd, start: slot.start, end: slot.end, office: slot.office || "" }}
        />
      )}
    </>
  );
};

export default FirstSlotButton;
