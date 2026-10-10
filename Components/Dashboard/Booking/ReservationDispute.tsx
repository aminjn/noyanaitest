"use client";

import { useState } from "react";
import classes from "./ReservationCancel.module.css";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

// An in-person visit with no check-in is counted as done for the doctor
// (2026-10) unless the patient objects within the window the API set
// (Reservation.disputeDeadline). The objection goes to support, who either
// refunds or keeps the visit as done.
type DisputeTarget = {
  _id: string;
  autoCompleted?: boolean;
  disputeDeadline?: string;
  dispute?: { at: string; reason: string } | null;
};

const DisputePopup = ({
  reservationId,
  ns,
  onDone,
}: {
  reservationId: string;
  ns: ContentNamespace[];
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(ns);
  const pushNotification = useNotification();
  const { closePopup } = usePopup();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/user/reservation/${reservationId}/dispute`,
        method: "POST",
        payload: { reason: reason.trim() },
      });
      pushNotification(getContent("visitDisputeSent"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification(
        err instanceof FetchError || err instanceof Error ? err.message : String(err),
        "Error",
      );
      setBusy(false);
    }
  };

  return (
    <PopupCard title={getContent("visitDisputeTitle")}>
      <div className={classes.popup}>
        <p className={classes.text}>{getContent("visitDisputeText")}</p>
        <label className={classes.reason}>
          <span>{getContent("visitDisputeReason")}</span>
          <textarea
            value={reason}
            maxLength={1000}
            rows={4}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className={classes.actions}>
          <Button mode="Outline" onClick={() => closePopup()}>
            {getContent("cancelBookingKeep")}
          </Button>
          <Button
            variant="Error"
            isLoading={busy}
            onClick={submit}
          >
            {getContent("visitDisputeSubmit")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

const ReservationDispute = ({
  reservation,
  ns,
  onDone,
}: {
  reservation: DisputeTarget;
  ns: ContentNamespace[];
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(ns);
  const { setPopup } = usePopup();

  if (reservation.dispute)
    return <p className={classes.done}>{getContent("visitDisputeOpen")}</p>;
  if (!reservation.autoCompleted || !reservation.disputeDeadline) return null;
  const deadline = new Date(reservation.disputeDeadline).getTime();
  if (!Number.isFinite(deadline) || deadline <= Date.now()) return null;

  return (
    <div className={classes.disputeBox}>
      <p className={classes.hint}>{getContent("visitDisputeHint")}</p>
      <Button
        variant="Error"
        mode="Outline"
        size="M"
        onClick={() =>
          setPopup(
            "DisputeReservation",
            <DisputePopup reservationId={reservation._id} ns={ns} onDone={onDone} />,
          )
        }
      >
        {getContent("visitDisputeButton")}
      </Button>
    </div>
  );
};

export default ReservationDispute;
