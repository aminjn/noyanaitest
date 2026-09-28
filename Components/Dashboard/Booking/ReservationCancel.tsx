"use client";

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

// Same rule as the API (Services/reservationCancelService.ts): the patient
// cancels online, fully refunded, up to 24h before; the doctor any time
// before the start.
const PATIENT_FREE_CANCEL_HOURS = 24;

type Side = "patient" | "doctor";

type CancelTarget = {
  _id: string;
  date: Date | string;
  start: number;
  status: ReservationStatus;
  total?: number;
};

const startsAt = (r: CancelTarget) =>
  new Date(r.date).getTime() + r.start * 60000;

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
      pushNotification(getContent("cancelledRefunded"), "Success");
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
            ? getContent("cancelBookingConfirmPatient", [
                currencize(reservation.total ?? 0),
              ])
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

  if (reservation.status === "cancelled")
    return <p className={classes.done}>{getContent("cancelledRefunded")}</p>;
  if (reservation.status !== "pending") return null;

  const msLeft = startsAt(reservation) - Date.now();
  if (msLeft <= 0) return null;
  if (side === "patient" && msLeft < PATIENT_FREE_CANCEL_HOURS * 3600 * 1000)
    return <p className={classes.hint}>{getContent("cancelClosedHint")}</p>;

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
