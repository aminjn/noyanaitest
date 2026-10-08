"use client";

import { useState } from "react";
import classes from "./CenterDoctorsPage.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { agreedPercent, CenterMember, declinedPercent, proposedPercent } from "./useCenterDoctors";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// The doctor's share of what the centre's insurers pay for their visits
// (2026-10, Lib/centreInsurerSplit.ts on the backend): the agreed
// percentage, the centre's proposal waiting for the doctor (the agreed one
// applies meanwhile) and the doctor's last "no". The centre proposes; only
// the doctor's acceptance changes it, and only for new bookings.
const MemberInsurerSplit = ({
  member,
  busy,
  propose,
  withdraw,
}: {
  member: CenterMember;
  busy: boolean;
  propose: (id: string, percent: number) => Promise<boolean>;
  withdraw: (id: string) => Promise<boolean>;
}) => {
  const getContent = useScopedLocale(NS);
  const intl = useIntlLocale();
  const n = (v: number) => new Intl.NumberFormat(intl).format(v);
  const agreed = agreedPercent(member.insurerSplit);
  const proposed = proposedPercent(member.insurerSplit);
  const declined = declinedPercent(member.insurerSplit);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(proposed ?? agreed));
  const parsed = Number(value);
  const valid = value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;

  return (
    <div className={classes.split}>
      <div className={classes.splitHead}>
        <span>{getContent("cisTitle")}</span>
        <strong>{getContent("cisToDoctor", [n(agreed)])}</strong>
      </div>
      {proposed != null && (
        <div className={classes.splitNote}>
          <span>{getContent("cisPending", [n(proposed)])}</span>
          <button type="button" className={classes.ghost} disabled={busy} onClick={() => withdraw(member._id)}>
            {getContent("cisWithdraw")}
          </button>
        </div>
      )}
      {proposed == null && declined != null && <p className={classes.splitMuted}>{getContent("cisDeclined", [n(declined)])}</p>}
      {editing ? (
        <form
          className={classes.splitForm}
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            propose(member._id, parsed).then((ok) => ok && setEditing(false));
          }}
        >
          <label className={classes.splitField}>
            <span>{getContent("cisPercentLabel")}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={!valid}
            />
          </label>
          <button type="submit" className={classes.primary} disabled={busy || !valid}>
            {getContent("cisPropose")}
          </button>
          <button type="button" className={classes.ghost} onClick={() => setEditing(false)}>
            {getContent("cancel")}
          </button>
        </form>
      ) : (
        <div className={classes.splitNote}>
          <p className={classes.splitMuted}>{getContent("cisHintCentre")}</p>
          <button
            type="button"
            className={classes.ghost}
            onClick={() => {
              setValue(String(proposed ?? agreed));
              setEditing(true);
            }}
          >
            {getContent("cisChange")}
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberInsurerSplit;
