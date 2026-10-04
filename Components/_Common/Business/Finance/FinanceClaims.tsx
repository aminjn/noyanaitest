"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import FinanceShell from "./FinanceShell";
import PaymentForm, { POPUP_KEY as PAY_KEY } from "./PaymentForm";
import {
  downloadCsv,
  FinClaim,
  InsurerKind,
  InsurerKinds,
  insurerKey,
  methodKey,
  nameOf,
  parseAmount,
  Pill,
  statusKey,
  useFin,
  useFinPopup,
  useFinText,
} from "./finShared";

const FORM_KEY = "FinClaimForm";
const VIEW_KEY = "FinClaimView";

type Candidate = { _id: string; number: number; date: string; party: { name: string }; insurer: { kind: InsurerKind; name: string; share: number }; total: number; lines: { title: string }[] };
type Typed = { date: Date; patient: string; service: string; total: string; share: string };

// A new claim (لیست بیمه): the insurer and the period, the invoices with
// its share not claimed yet (ticked by default), and lines typed in for
// services that had no invoice here.
const ClaimForm = ({ onDone }: { onDone: (c?: FinClaim) => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const { close } = useFinPopup();
  const pushNotification = useNotification();
  const [kind, setKind] = useState<InsurerKind>("tamin");
  const [name, setName] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [skip, setSkip] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState<Typed[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const query = useMemo(() => {
    const p = new URLSearchParams({ kind });
    if (from) p.set("from", isoDay(from));
    if (to) p.set("to", isoDay(to));
    return p.toString();
  }, [from, kind, to]);
  const { data } = useSWR<Candidate[]>(`${API}${api}/claims/candidates?${query}`, (url: string) => fetcher({ url }).then((res) => asArray<Candidate>(res.data)));
  const candidates = asArray<Candidate>(data);
  const picked = candidates.filter((c) => !skip.has(c._id));
  const insurerName = name.trim() || candidates[0]?.insurer?.name || t(insurerKey(kind));
  const total = picked.reduce((s, c) => s + (c.insurer?.share || 0), 0) + typed.reduce((s, l) => s + parseAmount(l.share), 0);
  const setLine = (i: number, patch: Partial<Typed>) => setTyped((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const save = async () => {
    if (busy || total <= 0) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}${api}/claims`,
        method: "POST",
        payload: {
          insurer: { kind, name: insurerName },
          from: from ? isoDay(from) : null,
          to: to ? isoDay(to) : null,
          invoices: picked.map((c) => c._id),
          items: typed
            .filter((l) => parseAmount(l.share) > 0)
            .map((l) => ({ date: isoDay(l.date), patient: l.patient.trim(), service: l.service.trim(), total: parseAmount(l.total), share: parseAmount(l.share) })),
          note: note.trim() || undefined,
        },
      });
      pushNotification(t("bizSaved"), "Success");
      close(FORM_KEY);
      onDone(res.data as FinClaim);
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("finNewClaim")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={classes.field}>
            <span>{t("finInsurerKind")}</span>
            <select value={kind} onChange={(e) => (setKind(e.target.value as InsurerKind), setSkip(new Set()))}>
              {InsurerKinds.map((k) => (
                <option key={k} value={k}>
                  {t(insurerKey(k))}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            <span>{t("finInsurerName")}</span>
            <input value={name} maxLength={120} placeholder={insurerName} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className={classes.field}>
            <DateInput title={t("bizFrom")} onChange={(d) => setFrom(d)} onClear={() => setFrom(null)} />
          </div>
          <div className={classes.field}>
            <DateInput title={t("bizTo")} onChange={(d) => setTo(d)} onClear={() => setTo(null)} />
          </div>
        </div>
        <span className={classes.cardTitle}>{t("finClaimFromInvoices")}</span>
        {candidates.length === 0 ? (
          <p className={classes.muted}>{t("finNoCandidates")}</p>
        ) : (
          <div className={classes.tableWrap} style={{ maxHeight: "40vh" }}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th />
                  <th>{t("bizDate")}</th>
                  <th>{t("finPatientName")}</th>
                  <th>{t("finService")}</th>
                  <th className={classes.num}>{t("finInsurerShare")}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={c.party?.name}
                        checked={!skip.has(c._id)}
                        onChange={(e) =>
                          setSkip((s) => {
                            const n = new Set(s);
                            if (e.target.checked) n.delete(c._id);
                            else n.add(c._id);
                            return n;
                          })
                        }
                      />
                    </td>
                    <td>{f.date(c.date)}</td>
                    <td className={classes.wrap}>{c.party?.name}</td>
                    <td className={classes.wrap}>{asArray<{ title: string }>(c.lines).map((l) => l.title).join("، ")}</td>
                    <td className={classes.num}>{f.money(c.insurer?.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <span className={classes.cardTitle}>{t("finClaimTyped")}</span>
        {typed.map((l, i) => (
          <div key={i} className={classes.form}>
            <div className={classes.field}>
              <DateInput title={t("bizDate")} defaultValue={l.date} onChange={(d) => setLine(i, { date: d })} />
            </div>
            <label className={classes.field}>
              <span>{t("finPatientName")}</span>
              <input value={l.patient} maxLength={200} onChange={(e) => setLine(i, { patient: e.target.value })} />
            </label>
            <label className={classes.field}>
              <span>{t("finService")}</span>
              <input value={l.service} maxLength={300} onChange={(e) => setLine(i, { service: e.target.value })} />
            </label>
            <label className={classes.field}>
              <span>{t("bizTotal")}</span>
              <input value={l.total} dir="ltr" inputMode="numeric" onChange={(e) => setLine(i, { total: e.target.value })} />
            </label>
            <label className={classes.field}>
              <span>{t("finInsurerShare")}</span>
              <input value={l.share} dir="ltr" inputMode="numeric" onChange={(e) => setLine(i, { share: e.target.value })} />
            </label>
            <button type="button" className={classes.removeLine} aria-label={t("bizDelete")} onClick={() => setTyped((ls) => ls.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        ))}
        <div className={classes.actions} style={{ justifyContent: "flex-start" }}>
          <button type="button" className={classes.ghost} onClick={() => setTyped((ls) => [...ls, { date: new Date(), patient: "", service: "", total: "", share: "" }])}>
            {t("finAddLine")}
          </button>
        </div>
        <label className={classes.field}>
          <span>{t("finNote")}</span>
          <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className={fin.summaryBar}>
          <span>
            {t("finClaimed")}: <b>{f.money(total)}</b> {t("toman")}
          </span>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => close(FORM_KEY)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || total <= 0} onClick={save}>
            {t("finSaveDraft")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const ClaimView = ({ id, onChanged }: { id: string; onChanged: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open, close } = useFinPopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<FinClaim>(`${API}${api}/claims/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as FinClaim));
  const [mode, setMode] = useState<"" | "submit" | "deduct" | "reject">("");
  const [tracking, setTracking] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const changed = () => {
    mutate();
    onChanged();
  };
  const act = async (path: string, payload: Record<string, unknown>, method: "POST" | "DELETE" = "POST") => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/claims/${id}${path}`, method, payload: method === "DELETE" ? undefined : payload });
      pushNotification(t("bizSaved"), "Success");
      setMode("");
      setReason("");
      setAmount("");
      if (method === "DELETE") {
        close(VIEW_KEY);
        onChanged();
      } else changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const openAmount = data ? Math.max(0, data.claimed - data.paid - data.deducted) : 0;
  const items = asArray<NonNullable<FinClaim["items"]>[number]>(data?.items);
  const exportCsv = () =>
    data &&
    downloadCsv(`claim-${data.number}`, [
      [t("bizDate"), t("finPatientName"), t("finService"), t("bizTotal"), t("finInsurerShare")],
      ...items.map((i) => [f.date(i.date), i.patient, i.service, i.total, i.share]),
    ]);
  return (
    <PopupCard title={data ? t("finClaimN", [f.year(data.number)]) : t("finClaim")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={fin.sheetHead}>
                <div className={fin.sheetMeta}>
                  <b>
                    {data.insurer?.name} · {t(insurerKey(data.insurer?.kind))}
                  </b>
                  <span>
                    {data.from || data.to ? `${data.from ? f.date(data.from) : "…"} – ${data.to ? f.date(data.to) : "…"}` : ""}
                    {data.submittedAt ? ` · ${t("finSubmittedOn")}: ${f.date(data.submittedAt)}` : ""}
                    {data.trackingCode ? ` · ${t("finTrackingCode")}: ${data.trackingCode}` : ""}
                  </span>
                </div>
                <Pill status={data.status}>{t(statusKey(data.status))}</Pill>
              </div>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finClaimed")}</span>
                  <span className={classes.tileValue}>{f.money(data.claimed)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finReceivedAmount")}</span>
                  <span className={`${classes.tileValue} ${classes.positive}`}>{f.money(data.paid)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finDeducted")}</span>
                  <span className={`${classes.tileValue} ${data.deducted > 0 ? classes.negative : ""}`}>{f.money(data.deducted)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("invDue")}</span>
                  <span className={classes.tileValue}>{f.money(openAmount)}</span>
                </div>
              </div>
              {!!data.rejectReason && (
                <p className={fin.notice}>
                  {t("finRejectReason")}: {data.rejectReason}
                </p>
              )}
              <div className={classes.tableWrap} style={{ maxHeight: "36vh" }}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizDate")}</th>
                      <th>{t("finPatientName")}</th>
                      <th>{t("finService")}</th>
                      <th className={classes.num}>{t("bizTotal")}</th>
                      <th className={classes.num}>{t("finInsurerShare")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i, n) => (
                      <tr key={n}>
                        <td>{f.date(i.date)}</td>
                        <td className={classes.wrap}>{i.patient || "—"}</td>
                        <td className={classes.wrap}>{i.service || "—"}</td>
                        <td className={classes.num}>{f.money(i.total)}</td>
                        <td className={classes.num}>{f.money(i.share)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(asArray<NonNullable<FinClaim["payments"]>[number]>(data.payments).length > 0 || asArray(data.deductions).length > 0) && (
                <dl className={fin.kv}>
                  {asArray<NonNullable<FinClaim["payments"]>[number]>(data.payments).map((p) => (
                    <div key={p._id}>
                      <dt>
                        {f.date(p.date)} · {t(methodKey(p.method))} · {nameOf(p.money, "")} {p.isVoid && <Pill status="void">{t("finStVoid")}</Pill>}
                      </dt>
                      <dd className={classes.positive}>{f.money(p.amount)}</dd>
                    </div>
                  ))}
                  {asArray<NonNullable<FinClaim["deductions"]>[number]>(data.deductions).map((d, n) => (
                    <div key={`d${n}`}>
                      <dt>
                        {f.date(d.at)} · {t("finDeducted")}: {d.reason}
                      </dt>
                      <dd className={classes.negative}>{f.money(d.amount)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {mode === "submit" && (
                <div className={classes.form}>
                  <label className={classes.field}>
                    <span>{t("finTrackingCode")}</span>
                    <input value={tracking} maxLength={80} dir="ltr" onChange={(e) => setTracking(e.target.value)} />
                  </label>
                  <div className={classes.actions}>
                    <button type="button" className={classes.primary} disabled={busy} onClick={() => act("/submit", { trackingCode: tracking.trim() || undefined })}>
                      {t("finSubmitClaim")}
                    </button>
                  </div>
                </div>
              )}
              {(mode === "deduct" || mode === "reject") && (
                <div className={classes.form}>
                  {mode === "deduct" && (
                    <label className={classes.field}>
                      <span>{t("bizAmount")}</span>
                      <input value={amount} dir="ltr" inputMode="numeric" onChange={(e) => setAmount(e.target.value)} />
                    </label>
                  )}
                  <label className={classes.field}>
                    <span>{t(mode === "deduct" ? "finDeductReason" : "finRejectReason")}</span>
                    <input value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
                  </label>
                  <div className={classes.actions}>
                    <button
                      type="button"
                      className={classes.danger}
                      disabled={busy || reason.trim().length < 2 || (mode === "deduct" && !parseAmount(amount))}
                      onClick={() => act("/deduct", mode === "reject" ? { all: true, reason: reason.trim() } : { amount: parseAmount(amount), reason: reason.trim() })}
                    >
                      {t(mode === "deduct" ? "finDeduct" : "finRejectRest")}
                    </button>
                  </div>
                </div>
              )}

              <div className={classes.actions}>
                <button type="button" className={classes.ghost} onClick={exportCsv}>
                  {t("finExportCsv")}
                </button>
                {canWrite && data.status === "draft" && (
                  <>
                    <button type="button" className={classes.danger} disabled={busy} onClick={() => window.confirm(t("bizDeleteConfirm")) && act("", {}, "DELETE")}>
                      {t("bizDelete")}
                    </button>
                    <button type="button" className={classes.primary} onClick={() => setMode(mode === "submit" ? "" : "submit")}>
                      {t("finSubmitClaim")}
                    </button>
                  </>
                )}
                {canWrite && data.status !== "draft" && (
                  <button type="button" className={classes.ghost} disabled={busy} onClick={() => window.confirm(t("finReopenConfirm")) && act("/reopen", {})}>
                    {t("finReopen")}
                  </button>
                )}
                {canWrite && openAmount > 0 && data.status !== "draft" && (
                  <>
                    <button type="button" className={classes.danger} onClick={() => setMode(mode === "reject" ? "" : "reject")}>
                      {t("finRejectRest")}
                    </button>
                    <button type="button" className={classes.ghost} onClick={() => setMode(mode === "deduct" ? "" : "deduct")}>
                      {t("finDeduct")}
                    </button>
                    <button
                      type="button"
                      className={classes.primary}
                      onClick={() => open(PAY_KEY, <PaymentForm direction="in" against="claim" docId={data._id} open={openAmount} party={data.insurer?.name} onDone={changed} />)}
                    >
                      {t("finRecordInsurerPayment")}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

type List = { items: FinClaim[]; aging: { d30: number; d60: number; d90: number; older: number }; unclaimed: { amount: number; count: number } };

const Body = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open } = useFinPopup();
  const params = useSearchParams();
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const { data, error, mutate } = useSWR<List>(`${API}${api}/claims?${new URLSearchParams({ ...(status ? { status } : {}), ...(kind ? { kind } : {}) })}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as List),
  );
  const rows = asArray<FinClaim>(data?.items);
  const view = (c: FinClaim) => open(VIEW_KEY, <ClaimView id={c._id} onChanged={() => mutate()} />);
  const create = () => open(FORM_KEY, <ClaimForm onDone={(c) => (mutate(), c && view(c))} />);
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current && canWrite && params?.get("new") === "1") {
      opened.current = true;
      create();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canWrite, params]);
  const tile = (label: string, value?: number, bad?: boolean) => (
    <div className={classes.tile}>
      <span className={classes.tileLabel}>{label}</span>
      <span className={`${classes.tileValue} ${bad && (value || 0) > 0 ? classes.negative : ""}`}>
        {f.money(value)}
        <span className={classes.tileUnit}>{t("toman")}</span>
      </span>
    </div>
  );
  return (
    <>
      <div className={classes.tiles}>
        {tile(t("finUnclaimed", [f.money(data?.unclaimed.count)]), data?.unclaimed.amount)}
        {tile(t("finAge30"), data?.aging.d30)}
        {tile(t("finAge60"), data?.aging.d60)}
        {tile(t("finAge90"), data?.aging.d90)}
        {tile(t("finAgeOlder"), data?.aging.older, true)}
      </div>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {["", "draft", "open", "paid", "rejected"].map((s) => (
              <button key={s || "all"} type="button" role="tab" aria-selected={status === s} className={status === s ? classes.on : ""} onClick={() => setStatus(s)}>
                {t(s === "open" ? "finStOpen" : s ? statusKey(s) : "finAll")}
              </button>
            ))}
          </div>
          <div className={classes.actions}>
            <select className={classes.ghost} value={kind} onChange={(e) => setKind(e.target.value)} aria-label={t("finInsurerKind")}>
              <option value="">{t("finAllInsurers")}</option>
              {InsurerKinds.map((k) => (
                <option key={k} value={k}>
                  {t(insurerKey(k))}
                </option>
              ))}
            </select>
            {canWrite && (
              <button type="button" className={classes.primary} onClick={create}>
                {t("finNewClaim")}
              </button>
            )}
          </div>
        </div>
        <p className={classes.muted}>{t("finClaimsHint")}</p>
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (rows.length === 0 ? (
              <p className={classes.empty}>{t("finNoClaims")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizNumber")}</th>
                      <th>{t("finInsurer")}</th>
                      <th>{t("finPeriod")}</th>
                      <th className={classes.num}>{t("finClaimed")}</th>
                      <th className={classes.num}>{t("finReceivedAmount")}</th>
                      <th className={classes.num}>{t("finDeducted")}</th>
                      <th>{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c._id} className={classes.rowLink} tabIndex={0} onClick={() => view(c)} onKeyDown={(e) => e.key === "Enter" && view(c)}>
                        <td>{f.year(c.number)}</td>
                        <td className={classes.wrap}>
                          {c.insurer?.name} <span className={fin.small}>({t(insurerKey(c.insurer?.kind))})</span>
                        </td>
                        <td>{c.from || c.to ? `${c.from ? f.date(c.from) : "…"} – ${c.to ? f.date(c.to) : "…"}` : "—"}</td>
                        <td className={classes.num}>{f.money(c.claimed)}</td>
                        <td className={classes.num}>{f.money(c.paid)}</td>
                        <td className={`${classes.num} ${c.deducted > 0 ? classes.negative : ""}`}>{f.money(c.deducted)}</td>
                        <td>
                          <Pill status={c.status}>{t(statusKey(c.status))}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </HandleLoading>
      </section>
    </>
  );
};

// «مالی و حسابداری» → مطالبات بیمه (2026-10): the monthly lists to Tamin,
// Salamat, the armed forces' insurer and supplementary insurers - the
// insurer's share of each invoice gathered, submitted with its tracking
// code, paid (often months later) and deducted (کسورات) with reasons, with
// the open amount aged.
const FinanceClaims = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finClaimsTitle" subtitle="finClaimsSubtitle" segment="insurance">
    <Body />
  </FinanceShell>
);

export default FinanceClaims;
