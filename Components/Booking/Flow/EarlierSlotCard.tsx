"use client";
import { useMemo, useState } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import Calendar02Icon from "@/Components/Icons/Calendar02Icon";
import { clock } from "./bookingFlow";
import { earlierReservationId, moveToOffer, useMyWaitlist } from "./MyWaitlists";
import classes from "./EarlierSlotCard.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow", "dashboardBooking"];

// «دنبال زمان زودتر هم بگرد» (2026-10, Doctolib's "earlier appointment"
// alert; backend Lib/waitlist.ts kind "earlier"): on a booked visit that
// can still be moved, the patient keeps a wait for an earlier slot of the
// same doctor and visit type. When one frees up they get an SMS whose link
// lands here (?earlier=1) and one tap moves the visit there - the
// patient's own reschedule, which frees the old slot for the next waiters.
const EarlierSlotCard = ({
  reservationId,
  highlight = false,
  onMoved,
}: {
  reservationId: string;
  // opened from the notice's link
  highlight?: boolean;
  onMoved: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" }),
    [intlTag],
  );
  const notify = useNotification();
  const { data, mutate, error } = useMyWaitlist();
  const [busy, setBusy] = useState<"" | "on" | "off" | "move">("");
  if (!data && !error) return null;
  const entry = (Array.isArray(data) ? data : []).find(
    (e) => e?.kind === "earlier" && e.status === "active" && earlierReservationId(e) === reservationId,
  );
  const today = tehranTodayYmd();
  const offer = entry?.offer && entry.offer.ymd >= today ? entry.offer : null;

  const run = async (kind: "on" | "off" | "move") => {
    if (busy) return;
    setBusy(kind);
    try {
      if (kind === "on")
        await fetcher({ url: `${API}/user/waitlist`, method: "POST", payload: { forReservation: reservationId } });
      if (kind === "off" && entry) await fetcher({ url: `${API}/user/waitlist/${entry._id}`, method: "DELETE" });
      if (kind === "move" && entry) {
        await moveToOffer(entry._id);
        notify(getContent("wlEarlierMoved"), "Success");
        onMoved();
      }
      await mutate();
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "Error");
    } finally {
      setBusy("");
    }
  };

  return (
    <section
      className={`${classes.card} ${offer ? classes.found : ""} ${highlight ? classes.highlight : ""}`}
      aria-label={getContent("wlEarlierTitle")}
    >
      <span className={`${classes.icon} ${offer ? "tone-teal" : "tone-indigo"}`}>
        <Ixon width="1.05rem">{offer ? <Calendar02Icon /> : <Bell01Icon />}</Ixon>
      </span>
      <div className={classes.text}>
        <b>
          {offer
            ? getContent("wlEarlierFound", [getContent("bfAtTime", [dayFmt.format(tehranNoon(offer.ymd)), clock(offer.start, nf)])])
            : entry
              ? getContent("wlEarlierOn")
              : getContent("wlEarlierTitle")}
        </b>
        <small>{offer ? getContent("wlEarlierFoundText") : getContent("wlEarlierText")}</small>
      </div>
      <div className={classes.actions}>
        {offer && (
          <Button size="M" radius="High" variant="Primary" isLoading={busy === "move"} onClick={() => run("move")}>
            {getContent("wlEarlierMove")}
          </Button>
        )}
        {entry ? (
          <Button size="M" radius="High" mode="Outline" variant="Neutral" isLoading={busy === "off"} onClick={() => run("off")}>
            {getContent("wlEarlierStop")}
          </Button>
        ) : (
          <Button size="M" radius="High" mode="Outline" isLoading={busy === "on"} onClick={() => run("on")}>
            {getContent("wlEarlierStart")}
          </Button>
        )}
      </div>
    </section>
  );
};

export default EarlierSlotCard;
