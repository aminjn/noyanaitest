"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useIntlLocale } from "@/Components/i18n/navigation";
import InitialAvatar from "@/Components/UI/InitialAvatar";
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
import { deskSessionTypes, formatPhone, PickedSlot, toYmd } from "./deskShared";
import classes from "./Desk.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelSchedule"];

type DeskPatient = { identity: string; name: string; phone: string; nationalIdTail: string; lastDate?: string };

// Book a patient at the desk or on the phone (2026-10). A returning patient
// is picked from the doctor's earlier visits (Doctolib's patient search);
// a new one is found by national ID (or verified with the civil registry),
// the booking goes to the owner of the mobile number, and it is paid at the
// visit.
const DeskBookingPopup = ({
  onDone,
  preset,
}: {
  onDone: () => unknown;
  // opened from a patient's file: that patient, already picked
  preset?: DeskPatient;
}) => {
  const intlTag = useIntlLocale();
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "short", year: "numeric" }), [intlTag]);
  const [mode, setMode] = useState<"returning" | "new">("returning");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<DeskPatient | null>(preset || null);
  const { data: found } = useSWR<DeskPatient[]>(
    mode === "returning" ? `${API}/doctor/desk/patients?q=${encodeURIComponent(q.trim())}` : null,
    (url: string) => fetcher({ url }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
    { keepPreviousData: true },
  );
  const patients = Array.isArray(found) ? found : [];
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
    if (mode === "returning" && !picked) return pushNotification(getContent("deskPickPatient"), "Error");
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/doctor/desk/reservation`,
        method: "POST",
        bodyParser: "JSON",
        payload:
          mode === "returning" && picked
            ? { identity: picked.identity, sessionType, ...slot }
            : { phone, nationalId, birthDate: birthDate || "", sessionType, ...slot },
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
        <span className={classes.label}>{getContent("deskWho")}</span>
        <div className={classes.chips} role="radiogroup">
          {(["returning", "new"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className={`${classes.chip} ${mode === m ? classes.chipOn : ""}`}
              onClick={() => setMode(m)}
            >
              {getContent(m === "returning" ? "deskReturning" : "deskNewPatient")}
            </button>
          ))}
        </div>
        {mode === "returning" && preset && picked?.identity === preset.identity ? (
          <div className={`${classes.patientItem} ${classes.patientOn}`}>
            <InitialAvatar name={preset.name || "?"} seed={preset.identity} size="2.25rem" />
            <span className={classes.patientText}>
              <strong>{preset.name || "—"}</strong>
              <small>{formatPhone(preset.phone)}</small>
            </span>
          </div>
        ) : mode === "returning" ? (
          <div className={classes.patientPick}>
            <Input
              title={getContent("deskSearchPatient")}
              inputMode="search"
              onChange={(e) => {
                setQ(e.target.value);
                setPicked(null);
              }}
            />
            {!patients.length ? (
              <p className={classes.muted}>{getContent(q.trim() ? "deskNoPatientFound" : "deskNoPatientsYet")}</p>
            ) : (
              <ul className={classes.patientList} role="listbox">
                {patients.map((p) => (
                  <li key={p.identity}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={picked?.identity === p.identity}
                      className={`${classes.patientItem} ${picked?.identity === p.identity ? classes.patientOn : ""}`}
                      onClick={() => setPicked(p)}
                    >
                      <InitialAvatar name={p.name || "?"} seed={p.identity} size="2.25rem" />
                      <span className={classes.patientText}>
                        <strong>{p.name || "—"}</strong>
                        <small>
                          {[
                            formatPhone(p.phone),
                            p.nationalIdTail ? getContent("deskIdTail", [p.nationalIdTail]) : "",
                            p.lastDate && !isNaN(new Date(p.lastDate).getTime())
                              ? getContent("deskLastVisit", [dateFmt.format(new Date(p.lastDate))])
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
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
        )}
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
