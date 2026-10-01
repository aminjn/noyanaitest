"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import SlotPicker from "./SlotPicker";
import { PickedSlot } from "./deskShared";
import classes from "./Desk.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelBooking"];

// Move a pending visit to another free session of the same type.
const MoveReservationPopup = ({
  reservationId,
  sessionType,
  onDone,
}: {
  reservationId: string;
  sessionType: string;
  onDone: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [slot, setSlot] = useState<PickedSlot | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!slot) return pushNotification(getContent("deskPickSlot"), "Error");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/doctor/reservation/${reservationId}/move`,
        method: "POST",
        bodyParser: "JSON",
        payload: slot,
      });
      pushNotification(getContent("deskMoved"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || getContent("deskNoSlots"), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={getContent("deskMove")}>
      <div className={classes.form}>
        <p className={classes.hint}>{getContent("deskMoveHint")}</p>
        <SlotPicker ns={NS} sessionType={sessionType} except={reservationId} value={slot} onChange={setSlot} />
        <div className={classes.actions}>
          <Button onClick={submit} isLoading={busy}>
            {getContent("deskMove")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default MoveReservationPopup;
