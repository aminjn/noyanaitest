"use client";
import { fromTehranLocalInput, tehranLocalInput } from "@/Components/helpers/tehranTime";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import classes from "../Accounting.module.css";
import s from "./CrmSales.module.css";

import { MiniContact, SalesMeta, useAction, useSalesText } from "./salesShared";
import { ContactChoice, ContactPicker, contactPayload, DayField } from "./SalesWidgets";

export const CALL_POPUP = "CrmsCall";
export const callStatuses = ["completed", "missed", "noAnswer", "busy", "voicemail"] as const;

export type Call = {
  _id: string;
  contact?: MiniContact | string | null;
  lead?: { _id: string; title: string } | string | null;
  direction: "inbound" | "outbound";
  status: (typeof callStatuses)[number];
  phone?: string;
  startedAt: string;
  durationSec: number;
  summary?: string;
  nextAction?: string;
  assignee?: string;
};

// "YYYY-MM-DDTHH:mm" in Tehran time (Components/helpers/tehranTime.ts)
const localTime = (v?: string) => tehranLocalInput(v ? new Date(v) : new Date());

// one call on a patient's file (Nexxa createCall / updateCallTranscript):
// it also stands on the patient's timeline
export const CallForm = ({
  meta,
  call,
  contact,
  lead,
  onDone,
}: {
  meta?: SalesMeta;
  call?: Call;
  contact?: MiniContact | null;
  lead?: string;
  onDone: () => void;
}) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const initial = call?.contact && typeof call.contact === "object" ? call.contact : contact || null;
  const [who, setWho] = useState<ContactChoice>(initial ? { contact: initial } : {});
  const [direction, setDirection] = useState<Call["direction"]>(call?.direction || "outbound");
  const [status, setStatus] = useState<Call["status"]>(call?.status || "completed");
  const [at, setAt] = useState(localTime(call?.startedAt));
  const [minutes, setMinutes] = useState(call ? String(Math.round((call.durationSec || 0) / 60)) : "");
  const [summary, setSummary] = useState(call?.summary || "");
  const [nextAction, setNextAction] = useState(call?.nextAction || "");
  const [assignee, setAssignee] = useState(call?.assignee || "");
  const save = async () => {
    const payload = {
      ...contactPayload(who),
      ...(lead ? { lead } : {}),
      direction,
      status,
      startedAt: fromTehranLocalInput(at).toISOString(),
      durationSec: Math.max(0, Math.round(Number(minutes) * 60) || 0),
      summary,
      nextAction,
      assignee: assignee || null,
    };
    const ok = await run(call ? "PATCH" : "POST", call ? `/calls/${call._id}` : "/calls", payload);
    if (ok) {
      closePopup(CALL_POPUP);
      onDone();
    }
  };
  return (
    <PopupCard title={t(call ? "crmsEditCall" : "crmsNewCall")} size="wide">
      <div className={classes.popup}>
        {!contact && <ContactPicker value={who} onChange={setWho} />}
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsDirection")}
            <select value={direction} onChange={(e) => setDirection(e.target.value as Call["direction"])}>
              <option value="outbound">{t("crmsOutbound")}</option>
              <option value="inbound">{t("crmsInbound")}</option>
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsCallResult")}
            <select value={status} onChange={(e) => setStatus(e.target.value as Call["status"])}>
              {callStatuses.map((x) => (
                <option key={x} value={x}>
                  {t(`crmsCall_${x}`)}
                </option>
              ))}
            </select>
          </label>
          <DayField label={t("crmsCallAt")} value={at.slice(0, 10)} onChange={(d) => d && setAt(`${d}T${at.slice(11, 16) || "00:00"}`)} />
          <label className={classes.field}>
            {t("crmeTime")}
            <input type="time" dir="ltr" value={at.slice(11, 16)} onChange={(e) => e.target.value && setAt(`${at.slice(0, 10)}T${e.target.value}`)} />
          </label>
          <label className={classes.field}>
            {t("crmsMinutes")}
            <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/[^\d.]/g, ""))} />
          </label>
          {meta && (
            <label className={classes.field}>
              {t("crmsAssignee")}
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">{t("crmsMe")}</option>
                {meta.staff.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <label className={classes.field}>
          {t("crmsCallSummary")}
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
        </label>
        <label className={classes.field}>
          {t("crmsNextAction")}
          <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
        </label>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || (!who.contact && !who.phone)} onClick={save}>
            {t("crmsSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};
