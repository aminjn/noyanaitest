"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import PopupCard from "@/Components/UI/PopupCard";
import Input from "@/Components/UI/Input";
import DateInput from "@/Components/UI/DateInput";
import Button from "@/Components/UI/Button";
import SlotPicker from "./SlotPicker";
import { deskSessionTypes, PickedSlot, toYmd } from "./deskShared";
import classes from "./Desk.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelSchedule"];

// Book a patient at the desk or on the phone (2026-10). The patient is
// found by national ID (or verified with the civil registry), the booking
// goes to the owner of the mobile number, and it is paid at the visit.
const DeskBookingPopup = ({ onDone }: { onDone: () => unknown }) => {
  const getContent = useScopedLocale(NS);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [sessionType, setSessionType] = useState<string>("inPerson");
  const [slot, setSlot] = useState<PickedSlot | null>(null);
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!slot) return pushNotification(getContent("deskPickSlot"), "Error");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/doctor/desk/reservation`,
        method: "POST",
        bodyParser: "JSON",
        payload: { phone, nationalId, birthDate: birthDate || "", sessionType, ...slot },
      });
      pushNotification(getContent("deskBooked"), "Success");
      closePopup();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || getContent("deskNoSlots"), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={getContent("deskNewBooking")}>
      <div className={classes.form}>
        <p className={classes.hint}>{getContent("deskNewBookingHint")}</p>
        <span className={classes.label}>{getContent("deskVisitType")}</span>
        <div className={classes.chips}>
          {deskSessionTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={`${classes.chip} ${sessionType === t ? classes.chipOn : ""}`}
              aria-pressed={sessionType === t}
              onClick={() => {
                setSessionType(t);
                setSlot(null);
              }}
            >
              {getContent(t as ContentKey)}
            </button>
          ))}
        </div>
        <SlotPicker key={sessionType} ns={NS} sessionType={sessionType} value={slot} onChange={setSlot} />
        <div className={classes.grid}>
          <Input
            title={getContent("deskPatientPhone")}
            inputMode="tel"
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            title={getContent("deskNationalId")}
            inputMode="numeric"
            onChange={(e) => setNationalId(e.target.value)}
          />
          <DateInput title={getContent("deskBirthDate")} onChange={(d) => setBirthDate(toYmd(d))} />
        </div>
        <div className={classes.actions}>
          <Button onClick={submit} isLoading={busy}>
            {getContent("deskSubmit")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {getContent("cancel")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default DeskBookingPopup;
