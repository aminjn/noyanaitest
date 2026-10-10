"use client";
import { ReactNode, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { doctorSessionTypeContentKeyDict } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { TEHRAN_TZ, tehranInstantOf } from "@/Components/helpers/tehranTime";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { DOMAIN } from "@/Components/config";
import Ixon from "@/Components/UI/Ixon";
import Button from "@/Components/UI/Button";
import CheckIcon from "@/Components/Icons/CheckIcon";
import Calendar02Icon from "@/Components/Icons/Calendar02Icon";
import DownloadIcon from "@/Components/Icons/DownloadIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import LightBulbIcon from "@/Components/Icons/LightBulbIcon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import MedicalRecordIcon from "@/Components/Icons/MedicalRecordIcon";
import StarIcon from "@/Components/Icons/StarIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import { visitTypeIcon, visitTypeTone } from "@/Components/Booking/Flow/BookingChoices";
import RescheduleSheet from "@/Components/Booking/Flow/RescheduleSheet";
import EarlierSlotCard from "@/Components/Booking/Flow/EarlierSlotCard";
import useChangeWindow from "@/Components/Booking/Flow/useChangeWindow";
import { clock, prepKeys } from "@/Components/Booking/Flow/bookingFlow";
import { IReservation } from "./DashboardManageBookingsPage";
import ReservationJoinButton from "./ReservationJoinButton";
import ReservationCancel from "./ReservationCancel";
import classes from "./BookingManagePanel.module.css";

// the map library loads after the page, not before it
const PlaceLocationCard = dynamic(() => import("@/Components/Map/PlaceLocationCard"), { ssr: false });

const NS: ContentNamespace[] = ["common", "dashboardBooking", "bookingFlow"];

type Reservation = IReservation<{
  Doctor: Record<never, never>;
  Office: Record<never, never>;
  User: Record<never, never>;
  Patient: Record<never, never>;
  Transaction: Record<never, never>;
}> & {
  payAtDesk?: boolean;
  deskFee?: number;
  clubDiscount?: number;
  insurance?: { _id?: string; name?: string } | null;
  intakeFilled?: boolean;
};

// "20261007T083000Z"
const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

// The booking's own page, top part (2026-10 booking redesign): step 3
// "confirmed" right after booking (?new=1), then the place to manage it -
// add to calendar, directions, what to prepare, what happens next,
// reschedule / cancel and joining an online visit (Doctolib / Zocdoc
// confirmation, Paziresh24's SMS-first reminders).
const BookingManagePanel = ({
  data,
  isNew,
  earlier = false,
  onChanged,
}: {
  data: Reservation;
  isNew: boolean;
  // opened from an earlier-slot notice (/w/<code> → ?earlier=1)
  earlier?: boolean;
  onChanged: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { hoursText, canChange } = useChangeWindow();
  const [moving, setMoving] = useState(false);

  const doctor = (data.doctor || {}) as unknown as IDoctorProfile & { slug?: string };
  const doctorName = doctor?._id ? getDoctorProfileLabel(doctor) : "—";
  const startsAt = tehranInstantOf(data.date, data.start);
  const endsAt = tehranInstantOf(data.date, data.end);
  const open = data.status === "pending" || data.status === "active";
  const office = data.office as unknown as { name?: string; address?: string; location?: { coordinates?: number[] } } | null;
  const inPerson = data.sessionType === "inPerson";
  const coords = office?.location?.coordinates;
  const dateText = startsAt.toLocaleDateString(intlTag, {
    timeZone: TEHRAN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const money = (n: number) => getContent("xToman", [nf.format(Math.max(0, Math.round(n)))]);
  const paid = data.total ?? (data.transaction ? Math.abs(data.transaction.amount) : 0);

  const title = getContent("bfIcsTitle", [doctorName]);
  const where = inPerson ? [office?.name, office?.address].filter(Boolean).join(" - ") : getContent(doctorSessionTypeContentKeyDict[data.sessionType]);
  const link = `${DOMAIN.replace(/\/$/, "")}/dashboard/booking/${data._id}`;
  const downloadIcs = () => {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NoyanAI//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${data._id}@noyan`,
      `DTSTAMP:${icsStamp(new Date())}`,
      `DTSTART:${icsStamp(startsAt)}`,
      `DTEND:${icsStamp(endsAt)}`,
      `SUMMARY:${icsText(title)}`,
      `LOCATION:${icsText(where)}`,
      `DESCRIPTION:${icsText(link)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsText(title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "noyan-visit.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const googleUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${icsStamp(startsAt)}/${icsStamp(endsAt)}`,
    location: where,
    details: link,
  }).toString()}`;

  const steps: { icon: ReactNode; key: ContentKey; done?: boolean; href?: string }[] = [
    { icon: <MedicalRecordIcon />, key: data.intakeFilled ? "bfNextIntakeDone" : "bfNextIntake", done: !!data.intakeFilled, href: "#intake" },
    { icon: <Bell01Icon />, key: "bfNextReminders" },
    { icon: inPerson ? <Calendar02Icon /> : visitTypeIcon[data.sessionType], key: inPerson ? "bfNextArrive" : "bfNextJoin" },
    { icon: <StarIcon />, key: "bfNextAfter" },
  ];

  return (
    <div className={classes.wrap}>
      {isNew && open && (
        <div className={classes.hero} role="status">
          <span className={`${classes.heroIcon} tone-teal`}>
            <Ixon width="1.5rem">
              <CheckIcon />
            </Ixon>
          </span>
          <div>
            <h1 className={classes.heroTitle}>{getContent("bfBookedTitle")}</h1>
            <p className={classes.heroText}>{getContent("bfBookedText")}</p>
          </div>
        </div>
      )}

      <div className={classes.card}>
        <div className={classes.when}>
          <span className={`${classes.typeIcon} ${visitTypeTone[data.sessionType] || "tone-indigo"}`}>
            <Ixon width="1.3rem">{visitTypeIcon[data.sessionType]}</Ixon>
          </span>
          <div className={classes.whenText}>
            <span>{dateText}</span>
            <strong>{getContent("fromTimeXtoTimeY", [clock(data.start, nf), clock(data.end, nf)])}</strong>
            <small>
              {[getContent(doctorSessionTypeContentKeyDict[data.sessionType]), doctorName, inPerson ? office?.name : ""]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </div>
        </div>

        <div className={classes.pay}>
          <Ixon width="1rem">
            <WalletIcon />
          </Ixon>
          <span>
            {data.payAtDesk
              ? getContent("bfPaidAtDesk", [money(data.deskFee || 0)])
              : paid > 0
                ? getContent("bfPaidOnline", [money(paid)])
                : getContent("bfPaidNothing")}
            {!!data.insurance?.name && ` · ${getContent("bfWithInsurance", [data.insurance.name])}`}
          </span>
        </div>

        {open && (
          <div className={classes.actions}>
            {data.status === "active" && (!!data.chat || !!data.callRoom) && (
              <ReservationJoinButton chat={data.chat} callRoom={data.callRoom} sessionType={data.sessionType} />
            )}
            <Button size="M" mode="Outline" radius="High" leadIcon={<DownloadIcon />} onClick={downloadIcs}>
              {getContent("bfAddToCalendar")}
            </Button>
            <a className={classes.textLink} href={googleUrl} target="_blank" rel="noopener noreferrer">
              {getContent("bfGoogleCalendar")}
            </a>
            {canChange(data) && (
              <Button size="M" mode="Outline" radius="High" leadIcon={<EditIcon />} onClick={() => setMoving(true)}>
                {getContent("bfReschedule")}
              </Button>
            )}
            {(canChange(data) || data.status !== "pending") && (
              <ReservationCancel
                side="patient"
                reservation={{ ...data, total: data.payAtDesk ? 0 : paid }}
                ns={NS}
                onDone={() => onChanged()}
              />
            )}
          </div>
        )}
        {open && data.status === "pending" && !canChange(data) && (
          <p className={classes.muted}>{getContent("bfChangeClosed", [hoursText])}</p>
        )}
      </div>

      {/* «دنبال زمان زودتر هم بگرد»: while the visit can still be moved */}
      {data.status === "pending" && canChange(data) && (
        <EarlierSlotCard reservationId={data._id} highlight={earlier} onMoved={onChanged} />
      )}

      {open && inPerson && !!coords && (
        <PlaceLocationCard coords={coords} name={office?.name} address={office?.address} />
      )}

      {open && (
        <div className={classes.grid}>
          <div className={classes.card}>
            <h2 className={classes.cardTitle}>
              <span className={`${classes.miniIcon} tone-amber`}>
                <Ixon width="0.95rem">
                  <LightBulbIcon />
                </Ixon>
              </span>
              {getContent("bfPrepare")}
            </h2>
            <ul className={classes.prep}>
              {(prepKeys[data.sessionType] || []).map((k) => (
                <li key={k}>{getContent(k)}</li>
              ))}
              {!!data.insurance?.name && <li>{getContent("bfPrepInsurance")}</li>}
            </ul>
          </div>
          <div className={classes.card}>
            <h2 className={classes.cardTitle}>
              <span className={`${classes.miniIcon} tone-violet`}>
                <Ixon width="0.95rem">
                  <Calendar02Icon />
                </Ixon>
              </span>
              {getContent("bfNextSteps")}
            </h2>
            <ol className={classes.steps}>
              {steps.map((s) => (
                <li key={s.key} className={s.done ? classes.stepDone : ""}>
                  <span className={classes.stepIcon}>
                    <Ixon width="0.9rem">{s.done ? <CheckIcon /> : s.icon}</Ixon>
                  </span>
                  {s.href && !s.done ? (
                    <a href={s.href} className={classes.textLink}>
                      {getContent(s.key)}
                    </a>
                  ) : (
                    <span>{getContent(s.key)}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {!!doctor?._id && (
        <RescheduleSheet
          open={moving}
          onClose={() => setMoving(false)}
          reservationId={data._id}
          doctorId={doctor._id}
          sessionType={data.sessionType}
          hoursText={hoursText}
          onDone={onChanged}
        />
      )}
    </div>
  );
};

export default BookingManagePanel;
