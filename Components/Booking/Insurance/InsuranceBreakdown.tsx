"use client";
import Ixon from "@/Components/UI/Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import classes from "./InsuranceBreakdown.module.css";

// The insurance split of one visit (2026-10, docs/booking-benchmark.md):
// the visit price, each insurer's line (basic, then supplementary) with its
// state, and what the patient pays, and whether that was paid online or at
// the desk. One component for the patient's booking page and list, the
// doctor's visit page and the admin's reservation page; each passes its
// texts (content keys on the site and panels, ta() in the admin panel) and
// its money format.

export type BreakdownLineStatus = "pending" | "booked" | "cancelled" | "reversed" | "desk" | "none";

export type BreakdownLine = {
  insurance?: string | { _id?: string; name?: string } | null;
  name?: string;
  role?: "basic" | "supplementary";
  planName?: string;
  share?: number;
  reason?: string;
  status?: BreakdownLineStatus | string;
  holder?: "doctor" | "centre";
  centreName?: string;
  // (2026-10) a centre's line: the doctor's percentage snapshotted at
  // booking and, once booked, what the centre owes them
  doctorPercent?: number | null;
  doctorShare?: number | null;
  claim?: string | null;
  eligibility?: { status?: string } | null;
};

export type BreakdownReservation = {
  payAtDesk?: boolean;
  deskFee?: number;
  deskPaidAt?: string | Date | null;
  total?: number;
  insuranceQuote?: {
    price?: number;
    net?: number;
    insurerShare?: number;
    patientShare?: number;
    lines?: BreakdownLine[];
  } | null;
};

export type BreakdownTexts = {
  title: string;
  price: string;
  basic: string;
  supplementary: string;
  patientShare: string;
  paidOnline: string;
  paidDesk: string;
  deskPaid: string;
  status: Record<BreakdownLineStatus, string>;
  reason: (reason: string) => string;
  viaCentre: (name: string) => string;
  verified: string;
  onClaim: string;
  estimate: string;
  // the doctor's share of a centre's line - only the doctor's visit page and
  // the admin pass it (the patient does not see the doctor-centre split)
  doctorShare?: (percent: number, amount: string) => string;
};

const asList = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const knownStatus = (s: unknown): BreakdownLineStatus =>
  (["pending", "booked", "cancelled", "reversed", "desk", "none"] as const).includes(s as BreakdownLineStatus)
    ? (s as BreakdownLineStatus)
    : "none";

// a centre's line: the percentage (none = 100%, the rule before 2026-10)
// and the doctor's amount - the booked figure, else the estimate
const doctorShareOf = (l: BreakdownLine, share: number, money: (n: number) => string): [number, string] => {
  const raw = Number(l.doctorPercent);
  const percent = l.doctorPercent == null || !Number.isFinite(raw) ? 100 : Math.min(100, Math.max(0, raw));
  const booked = Number(l.doctorShare);
  return [percent, money(l.doctorShare != null && Number.isFinite(booked) ? booked : Math.round((share * percent) / 100))];
};

// a reservation with nothing to split (no insurance picked) shows nothing
export const hasInsuranceBreakdown = (r?: BreakdownReservation | null) => asList(r?.insuranceQuote?.lines).length > 0;

const InsuranceBreakdown = ({
  reservation,
  text,
  money,
  compact = false,
  className = "",
}: {
  reservation: BreakdownReservation | null | undefined;
  text: BreakdownTexts;
  money: (n: number) => string;
  // the list row: lines and the patient's share, no notes
  compact?: boolean;
  className?: string;
}) => {
  const q = reservation?.insuranceQuote;
  const lines = asList<BreakdownLine>(q?.lines).filter((l) => !!l && typeof l === "object");
  if (!q || !lines.length) return null;
  const desk = !!reservation?.payAtDesk;
  const patient = Math.max(0, Number(q.patientShare) || 0);
  const nameOf = (l: BreakdownLine) =>
    l.name || (l.insurance && typeof l.insurance === "object" ? l.insurance.name || "" : "") || "—";
  return (
    <div className={`${classes.box} ${compact ? classes.compact : ""} ${className}`}>
      <div className={classes.head}>
        <span>{text.title}</span>
        <span className={classes.pay}>
          {desk ? (reservation?.deskPaidAt ? text.deskPaid : text.paidDesk) : text.paidOnline}
        </span>
      </div>
      <ul className={classes.list}>
        {!compact && Number(q.price) > 0 && (
          <li className={classes.row}>
            <span className={classes.label}>{text.price}</span>
            <span className={classes.amount}>
              <b>{money(Number(q.price) || 0)}</b>
            </span>
          </li>
        )}
        {lines.map((l, i) => {
          const status = knownStatus(l.status);
          const share = Math.max(0, Number(l.share) || 0);
          return (
            <li key={`${nameOf(l)}-${i}`} className={classes.row}>
              <span className={classes.label}>
                <span>{l.planName ? `${nameOf(l)} · ${l.planName}` : nameOf(l)}</span>
                <small>{l.role === "basic" ? text.basic : text.supplementary}</small>
                {!compact && l.holder === "centre" && !!l.centreName && <small>{text.viaCentre(l.centreName)}</small>}
                {!compact && l.holder === "centre" && !!text.doctorShare && share > 0 && (
                  <small className={classes.doctorShare}>{text.doctorShare(...doctorShareOf(l, share, money))}</small>
                )}
                {!compact && l.eligibility?.status === "verified" && (
                  <span className={classes.verified}>
                    <Ixon width="0.8rem">
                      <ShieldCheckIcon />
                    </Ixon>
                    {text.verified}
                  </span>
                )}
              </span>
              <span className={classes.amount}>
                <b>{share > 0 ? money(share) : l.reason ? text.reason(l.reason) : "—"}</b>
                {share > 0 && (
                  <span className={`${classes.status} ${classes[`st-${status}`] || ""}`}>
                    {l.claim && status === "booked" ? text.onClaim : text.status[status]}
                  </span>
                )}
              </span>
            </li>
          );
        })}
        <li className={`${classes.row} ${classes.you}`}>
          <span className={classes.label}>{text.patientShare}</span>
          <span className={classes.amount}>
            <b>{money(patient)}</b>
          </span>
        </li>
      </ul>
      {!compact && <p className={classes.note}>{text.estimate}</p>}
    </div>
  );
};

export default InsuranceBreakdown;
