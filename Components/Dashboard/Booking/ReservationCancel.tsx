"use client";
import { tehranInstantOf } from "@/Components/helpers/tehranTime";

import { useIntlLocale } from "@/Components/i18n/navigation";
import { useMyPro } from "@/Components/Pro/useProData";
import { useState } from "react";
import classes from "./ReservationCancel.module.css";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ReservationStatus } from "./reservationStatus";
import useSiteSettings from "@/Components/Hooks/useSiteSettings";

// Same rule as the API (Services/reservationCancelService.ts): the patient
// cancels online, fully refunded, up to the super admin's free-cancel window
// (booking settings, default 24h) before; the doctor any time before the
// start.

type Side = "patient" | "doctor";

type CancelTarget = {
  _id: string;
  date: Date | string;
  start: number;
  status: ReservationStatus;
  total?: number;
};

// the visit's day at its Tehran minutes (Components/helpers/tehranTime.ts)
const startsAt = (r: CancelTarget) => tehranInstantOf(r.date, r.start).getTime();

// Popup body keeps its own state: popup content is rendered from a
// snapshot and doesn't receive fresh props after it opens.
const ConfirmCancelPopup = ({
  side,
  reservation,
  ns,
  onDone,
}: {
  side: Side;
  reservation: CancelTarget;
  ns: ContentNamespace[];
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(ns);
  const pushNotification = useNotification();
  const { closePopup } = usePopup();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url:
          side === "patient"
            ? `${API}/user/reservation/${reservation._id}/cancel`
            : `${API}/doctor/reservation/${reservation._id}/cancel`,
        method: side === "patient" ? "POST" : "PATCH",
        payload: reason.trim() ? { reason: reason.trim() } : {},
      });
      pushNotification(getContent(reservation.total || side === "doctor" ? "cancelledRefunded" : "bfCancelled"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification(
        err instanceof FetchError || err instanceof Error
          ? err.message
          : String(err),
        "Error",
      );
      setBusy(false);
    }
  };

  return (
    <PopupCard title={getContent("cancelBooking")}>
      <div className={classes.popup}>
        <p className={classes.text}>
          {side === "patient"
            ? // nothing was paid online (pay at the desk): nothing to refund
              reservation.total
              ? getContent("cancelBookingConfirmPatient", [
                  currencize(reservation.total),
                ])
              : getContent("bfCancelConfirmNoCharge")
            : getContent("cancelBookingConfirmDoctor")}
        </p>
        <label className={classes.reason}>
          <span>{getContent("cancelReasonOptional")}</span>
          <textarea
            value={reason}
            maxLength={500}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className={classes.actions}>
          <Button mode="Outline" onClick={() => closePopup()}>
            {getContent("cancelBookingKeep")}
          </Button>
          <Button variant="Error" isLoading={busy} onClick={submit}>
            {getContent("cancelBookingYes")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

const ReservationCancel = ({
  side,
  reservation,
  ns,
  onDone,
}: {
  side: Side;
  reservation: CancelTarget;
  ns: ContentNamespace[];
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(ns);
  const { setPopup } = usePopup();
  const { patientFreeCancelHours: siteHours, freeCancelHoursText: siteHoursText } = useSiteSettings();
  // a «پرو» member's window is shorter (server: Lib/patientPro.ts
  // freeCancelHoursFor); the page follows what the API will accept
  const { data: pro } = useMyPro();
  const intlTag = useIntlLocale();
  const proHours = side === "patient" && pro?.active ? pro.freeCancelHours : null;
  const patientFreeCancelHours =
    proHours !== null && proHours >= 0 && proHours < siteHours ? proHours : siteHours;
  const freeCancelHoursText =
    patientFreeCancelHours === siteHours ? siteHoursText : new Intl.NumberFormat(intlTag).format(patientFreeCancelHours);

  if (reservation.status === "cancelled")
    return (
      <p className={classes.done}>
        {getContent(reservation.total || side === "doctor" ? "cancelledRefunded" : "bfCancelled")}
      </p>
    );
  if (reservation.status !== "pending") return null;

  const msLeft = startsAt(reservation) - Date.now();
  if (msLeft <= 0) return null;
  if (side === "patient" && msLeft < patientFreeCancelHours * 3600 * 1000)
    return (
      <p className={classes.hint}>
        {getContent("cancelClosedHint", [freeCancelHoursText])}
      </p>
    );

  return (
    <Button
      variant="Error"
      mode="Outline"
      size="S"
      onClick={() =>
        setPopup(
          "CancelReservation",
          <ConfirmCancelPopup
            side={side}
            reservation={reservation}
            ns={ns}
            onDone={onDone}
          />,
        )
      }
    >
      {getContent("cancelBooking")}
    </Button>
  );
};

export default ReservationCancel;
