"use client";

import { useState } from "react";
import classes from "./CentreSplitCell.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import {
  agreedPercent,
  InsurerSplit,
  proposedPercent,
} from "@/Components/_Common/CenterDoctors/useCenterDoctors";

// The doctor's side of a centre's share of the insurers' payments (2026-10,
// Lib/centreInsurerSplit.ts on the backend): the agreed percentage in the
// memberships table, and each centre's proposal above it to accept or
// decline. The agreed one applies until the doctor accepts; the new one
// applies to bookings made after that. The proposal shown is sent back, so
// one changed meanwhile is not accepted in its place.

type Kind = "clinic" | "hospital";
const nsOf = (kind: Kind): ContentNamespace[] => ["common", kind === "clinic" ? "doctorPanelClinic" : "doctorPanelHospital"];

// the table cell: "70% to you" (and the pending proposal, in short)
export const CentreSplitCell = ({ kind, split }: { kind: Kind; split?: InsurerSplit | null }) => {
  const getContent = useScopedLocale(nsOf(kind));
  const intl = useIntlLocale();
  const n = (v: number) => new Intl.NumberFormat(intl).format(v);
  const proposed = proposedPercent(split);
  return (
    <span className={classes.inline}>
      <b>{getContent("cisToYou", [n(agreedPercent(split))])}</b>
      {proposed != null && <span className={classes.badge}>{getContent("cisOffer", [n(proposed)])}</span>}
    </span>
  );
};

export type SplitMembership = { _id: string; centreName?: string; insurerSplit?: InsurerSplit | null };

// the proposals waiting for the doctor, one card each
export const CentreSplitOffers = ({
  kind,
  items,
  onChanged,
}: {
  kind: Kind;
  items: SplitMembership[];
  onChanged: () => unknown;
}) => {
  const getContent = useScopedLocale(nsOf(kind));
  const intl = useIntlLocale();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState<string | null>(null);
  const n = (v: number) => new Intl.NumberFormat(intl).format(v);
  const open = (Array.isArray(items) ? items : []).filter((m) => m && m._id && proposedPercent(m.insurerSplit) != null);
  if (!open.length) return null;

  const answer = async (m: SplitMembership, accept: boolean) => {
    const proposed = proposedPercent(m.insurerSplit);
    if (proposed == null) return;
    setBusy(m._id);
    try {
      await fetcher({
        url: `${API}/doctor/${kind}/${m._id}/split`,
        method: "POST",
        bodyParser: "JSON",
        payload: { accept, doctorPercent: proposed },
      });
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(null);
      await onChanged();
    }
  };

  return (
    <div className={classes.offers}>
      {open.map((m) => (
        <section key={m._id} className={classes.offer}>
          <div className={classes.offerText}>
            <span className={classes.offerTitle}>
              {getContent("cisTitle")}
              {m.centreName ? ` · ${m.centreName}` : ""}
            </span>
            <strong>
              {getContent("cisOffer", [n(proposedPercent(m.insurerSplit) as number)])}
              <span className={classes.now}> · {getContent("cisToYou", [n(agreedPercent(m.insurerSplit))])}</span>
            </strong>
            <small>{getContent("cisOfferHint")}</small>
          </div>
          <div className={classes.actions}>
            <button type="button" className={classes.accept} disabled={busy === m._id} onClick={() => answer(m, true)}>
              {getContent("cisAccept")}
            </button>
            <button type="button" className={classes.decline} disabled={busy === m._id} onClick={() => answer(m, false)}>
              {getContent("cisDecline")}
            </button>
          </div>
        </section>
      ))}
    </div>
  );
};

export default CentreSplitCell;
