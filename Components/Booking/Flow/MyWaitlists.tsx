"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { DoctorSessionType, doctorSessionTypeContentKeyDict } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { diffDaysYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd, tehranYmd as tehranYmdOf } from "@/Components/helpers/tehranTime";
import Ixon from "@/Components/UI/Ixon";
import Link from "@/Components/i18n/Link";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import { clock, finalizeHref } from "./bookingFlow";
import classes from "./MyWaitlists.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

export type MyWaitlistEntry = {
  _id: string;
  doctor:
    | { _id?: string; firstName?: string; lastName?: string; slug?: string; mainSpeciality?: { name?: string } | null }
    | string
    | null;
  sessionType: DoctorSessionType;
  office?: { _id?: string; name?: string } | string | null;
  officeKey?: string;
  from: string;
  to: string;
  days?: number;
  status: "active" | "booked" | "cancelled" | "expired";
  offer?: { ymd: string; start: number; end: number; office?: string; holdUntil?: string } | null;
  // (2026-10) "earlier": looking for an earlier slot for a booked visit
  kind?: "slot" | "earlier";
  forReservation?: { _id?: string; date?: string; start?: number; end?: number; status?: string } | string | null;
  // a family member the wait is for (none: the account's own)
  patient?: { _id?: string; givenName?: string; lastName?: string } | string | null;
};

// the reservation an earlier-slot wait moves
export const earlierReservationId = (e: MyWaitlistEntry) =>
  e.forReservation && typeof e.forReservation === "object" ? e.forReservation._id || "" : String(e.forReservation || "");

// the one tap of an earlier-slot offer (POST /user/waitlist/:id/move)
export const moveToOffer = (entryId: string) => fetcher({ url: `${API}/user/waitlist/${entryId}/move`, method: "POST" });

export const useMyWaitlist = (enabled = true) =>
  useSWR<MyWaitlistEntry[]>(enabled ? `${API}/user/waitlist` : null, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
  );

const statusKey: Record<MyWaitlistEntry["status"], ContentKey> = {
  active: "bfWlStatusActive",
  booked: "bfWlStatusBooked",
  cancelled: "bfWlStatusCancelled",
  expired: "bfWlStatusExpired",
};

// The patient's waits («نوبت‌های من», 2026-10): the active ones with the
// slot last offered (one tap to book it) and "stop waiting"; the ones that
// ended recently, dimmed. Hidden when there is none.
const MyWaitlists = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "short", day: "numeric", month: "long" }),
    [intlTag],
  );
  const notify = useNotification();
  const { data, mutate } = useMyWaitlist();
  const [busy, setBusy] = useState<string | null>(null);
  const list = (Array.isArray(data) ? data : []).filter((e) => !!e?._id && !!e.from && !!e.to);
  if (!list.length) return null;
  const today = tehranTodayYmd();
  const day = (ymd: string) => {
    const diff = diffDaysYmd(today, ymd);
    if (diff === 0) return getContent("today");
    if (diff === 1) return getContent("tomorrow");
    return dayFmt.format(tehranNoon(ymd));
  };

  const move = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      await moveToOffer(id);
      notify(getContent("wlEarlierMoved"), "Success");
      await mutate();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(null);
    }
  };

  const leave = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      await fetcher({ url: `${API}/user/waitlist/${id}`, method: "DELETE" });
      notify(getContent("bfWlLeft"), "Success");
      await mutate();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={classes.box} aria-label={getContent("bfWlMineTitle")}>
      <h2 className={classes.title}>
        <span className={`${classes.icon} tone-indigo`}>
          <Ixon width="1rem">
            <Bell01Icon />
          </Ixon>
        </span>
        {getContent("bfWlMineTitle")}
      </h2>
      <ul className={classes.list}>
        {list.map((e) => {
          const doctor = e.doctor && typeof e.doctor === "object" ? e.doctor : null;
          const doctorId = doctor?._id || (typeof e.doctor === "string" ? e.doctor : "");
          const name = [doctor?.firstName, doctor?.lastName].filter(Boolean).join(" ") || "—";
          const officeName = e.office && typeof e.office === "object" ? e.office.name : "";
          const active = e.status === "active";
          const offer = active && e.offer && e.offer.ymd >= today ? e.offer : null;
          const earlier = e.kind === "earlier";
          const visit = e.forReservation && typeof e.forReservation === "object" ? e.forReservation : null;
          const member =
            e.patient && typeof e.patient === "object" ? [e.patient.givenName, e.patient.lastName].filter(Boolean).join(" ") : "";
          const visitAt =
            visit?.date && typeof visit.start === "number"
              ? getContent("bfAtTime", [day(tehranYmdOf(visit.date)), clock(visit.start, nf)])
              : "";
          return (
            <li key={e._id} className={`${classes.item} ${active ? "" : classes.ended}`}>
              <div className={classes.main}>
                <strong>{name}</strong>
                <span className={classes.meta}>
                  {[
                    getContent(doctorSessionTypeContentKeyDict[e.sessionType] || "bfVisitType"),
                    e.sessionType === "inPerson" ? officeName || getContent("bfWlAnyOffice") : "",
                    earlier && visitAt ? getContent("wlEarlierBadge", [visitAt]) : getContent("bfWlRange", [day(e.from), day(e.to)]),
                    member ? getContent("wlForMember", [member]) : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {!!offer && (
                  <span className={classes.offer}>
                    {getContent("bfWlOffered", [getContent("bfAtTime", [day(offer.ymd), clock(offer.start, nf)])])}
                  </span>
                )}
              </div>
              <span className={`${classes.badge} ${active ? classes.badgeOn : ""}`}>{getContent(statusKey[e.status])}</span>
              {active && (
                <div className={classes.actions}>
                  {!!offer && earlier && (
                    <button type="button" className={classes.primary} disabled={busy === e._id} onClick={() => move(e._id)}>
                      {getContent("wlEarlierMove")}
                    </button>
                  )}
                  {!!offer && !earlier && !!doctorId && (
                    <Link
                      className={classes.primary}
                      href={finalizeHref(doctorId, {
                        ymd: offer.ymd,
                        start: offer.start,
                        end: offer.end,
                        sessionType: e.sessionType,
                        office: offer.office,
                        patient: e.patient && typeof e.patient === "object" ? e.patient._id : undefined,
                      })}
                    >
                      {getContent("bfWlBook")}
                    </Link>
                  )}
                  <button
                    type="button"
                    className={classes.ghost}
                    disabled={busy === e._id}
                    onClick={() => leave(e._id)}
                  >
                    {getContent("bfWlLeave")}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default MyWaitlists;
