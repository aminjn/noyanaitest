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
import {
  ClaimLineDecision,
  decisionKey,
  downloadCsv,
  FinClaim,
  FinMoney,
  insurerKey,
  parseAmount,
  Pill,
  reviewKey,
  reviewTone,
  useFin,
  useFinPopup,
  useFinText,
  useMoneyAccounts,
} from "./finShared";

// «مالی و حسابداری» → مطالبات دریافتی از مراکز (2026-10): the lists centres
// send to this insurer on Noyan, reviewed the way the Salamat and Tamin
// portals return a list (رسیدگی اسناد): each line accepted, deducted with a
// reason (کسورات) or rejected; the result registered once with its date;
// then the accepted amount paid in one or several payments. Each step posts
// on the insurer's books and the centre's (Lib/business/insurerClaims.ts).

const VIEW_KEY = "FinClaimInView";

type Received = FinClaim & { open: number; lines?: number };
type List = {
  items: Received[];
  totals: { pending: { count: number; amount: number }; payable: { count: number; amount: number }; paid: number };
};
type Draft = { status: ClaimLineDecision; amount: string; reason: string };

// the reasons Iranian insurers return most (the portals' کسورات codes)
const REASONS = ["finDedTariff", "finDedDocs", "finDedCoverage", "finDedDuplicate", "finDedEligibility"];

const lineTone = (s: ClaimLineDecision) => (s === "accepted" ? "paid" : s === "rejected" ? "rejected" : "partial");

const PayForm = ({ claim, onDone }: { claim: Received; onDone: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const pushNotification = useNotification();
  const { data: moneyData, mutate: mutateMoney } = useMoneyAccounts();
  const money = asArray<FinMoney>(moneyData).filter((m) => m.isActive !== false && m.kind !== "wallet");
  const [amount, setAmount] = useState(String(claim.open || ""));
  const [via, setVia] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  // one key per payment typed: a double click or a retry pays once
  const key = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
  const value = parseAmount(amount);
  const ready = value > 0 && value <= claim.open && !!via;
  const pay = async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/claims-in/${claim._id}/pay`,
        method: "POST",
        payload: { amount: value, money: via, date: isoDay(date), reference: reference.trim() || undefined, key: key.current },
      });
      pushNotification(t("finClaimInPaid"), "Success");
      key.current = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      mutateMoney();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={fin.subCard}>
      <span className={classes.cardTitle}>{t("finClaimInPay")}</span>
      <p className={classes.muted}>{t("finClaimInPayHint", [f.money(claim.open)])}</p>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("bizAmount")}</span>
          <input value={amount} dir="ltr" inputMode="numeric" onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("finPaidFrom")}</span>
          <select value={via} onChange={(e) => setVia(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {money.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} · {f.money(m.balance)}
              </option>
            ))}
          </select>
        </label>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        <label className={classes.field}>
          <span>{t("finReference")}</span>
          <input value={reference} maxLength={80} dir="ltr" onChange={(e) => setReference(e.target.value)} />
        </label>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.primary} disabled={busy || !ready} onClick={pay}>
          {t("finClaimInPay")}
        </button>
      </div>
    </section>
  );
};

const ReviewView = ({ id, onChanged }: { id: string; onChanged: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<Received>(`${API}${api}/claims-in/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as Received));
  const items = asArray<NonNullable<FinClaim["items"]>[number]>(data?.items);
  const pending = data?.review?.status === "pending";
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  // the saved decisions are the starting point of the form
  useEffect(() => {
    if (!data) return;
    const next: Record<number, Draft> = {};
    asArray<NonNullable<FinClaim["items"]>[number]>(data.items).forEach((i, n) => {
      next[n] = { status: i.decision?.status || "accepted", amount: i.decision?.status === "deducted" ? String(i.decision.deducted) : "", reason: i.decision?.reason || "" };
    });
    setDrafts(next);
    setNote(data.review?.note || "");
  }, [data]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const set = (n: number, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [n]: { ...(d[n] || { status: "accepted", amount: "", reason: "" }), ...patch } }));
  // what the form decides, line by line (the server checks it again)
  const sums = useMemo(() => {
    let approved = 0;
    let deducted = 0;
    let invalid = 0;
    items.forEach((i, n) => {
      const d = drafts[n] || { status: "accepted", amount: "", reason: "" };
      if (d.status === "accepted") approved += i.share;
      else if (d.status === "rejected") {
        deducted += i.share;
        if (!d.reason.trim()) invalid++;
      } else {
        const cut = Math.min(i.share, parseAmount(d.amount));
        if (!(cut > 0) || cut >= i.share || !d.reason.trim()) invalid++;
        approved += i.share - cut;
        deducted += cut;
      }
    });
    return { approved, deducted, invalid };
  }, [drafts, items]);
  const payload = () => ({
    lines: items.map((_, n) => {
      const d = drafts[n] || { status: "accepted", amount: "", reason: "" };
      return { index: n, status: d.status, amount: d.status === "deducted" ? parseAmount(d.amount) : undefined, reason: d.status === "accepted" ? undefined : d.reason.trim() };
    }),
    note: note.trim(),
  });
  const save = async (decide: boolean) => {
    if (busy || sums.invalid) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/claims-in/${id}/lines`, method: "PATCH", payload: payload() });
      if (decide) await fetcher({ url: `${API}${api}/claims-in/${id}/decide`, method: "POST", payload: { date: isoDay(date) } });
      pushNotification(t(decide ? "finClaimInDecided" : "bizSaved"), "Success");
      setConfirming(false);
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const exportCsv = () =>
    data &&
    downloadCsv(`claim-in-${data.number}`, [
      [t("bizDate"), t("finPatientName"), t("finService"), t("bizTotal"), t("finInsurerShare"), t("finInsurerDecision"), t("finDeducted"), t("finDeductReason")],
      ...items.map((i) => [f.date(i.date), i.patient, i.service, i.total, i.share, i.decision ? t(decisionKey(i.decision.status)) : "", i.decision?.deducted || 0, i.decision?.reason || ""]),
    ]);
  const review = data?.review;
  return (
    <PopupCard title={data ? t("finClaimInN", [f.year(data.number)]) : t("finClaimsInTitle")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={fin.sheetHead}>
                <div className={fin.sheetMeta}>
                  <b>{data.centreName || "—"}</b>
                  <span>
                    {[
                      t(insurerKey(data.insurer?.kind)),
                      data.from || data.to ? `${data.from ? f.date(data.from) : "…"} – ${data.to ? f.date(data.to) : "…"}` : "",
                      data.submittedAt ? `${t("finSubmittedOn")}: ${f.date(data.submittedAt)}` : "",
                      data.trackingCode ? `${t("finTrackingCode")}: ${data.trackingCode}` : "",
                      review?.decidedAt ? `${t("finDecidedOn")}: ${f.date(review.decidedAt)}` : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <Pill status={reviewTone(review)}>{t(reviewKey(review))}</Pill>
              </div>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finClaimed")}</span>
                  <span className={classes.tileValue}>{f.money(data.claimed)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finApproved")}</span>
                  <span className={`${classes.tileValue} ${classes.positive}`}>{f.money(pending ? sums.approved : review?.approved)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finDeducted")}</span>
                  <span className={`${classes.tileValue} ${(pending ? sums.deducted : review?.deducted || 0) > 0 ? classes.negative : ""}`}>
                    {f.money(pending ? sums.deducted : review?.deducted)}
                  </span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finClaimInOpen")}</span>
                  <span className={classes.tileValue}>{f.money(data.open)}</span>
                </div>
              </div>
              {pending && canWrite && <p className={classes.muted}>{t("finClaimInReviewHint")}</p>}
              <datalist id="fin-ded-reasons">
                {REASONS.map((r) => (
                  <option key={r} value={t(r)} />
                ))}
              </datalist>
              <div className={classes.tableWrap} style={{ maxHeight: "44vh" }}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizDate")}</th>
                      <th>{t("finPatientName")}</th>
                      <th>{t("finService")}</th>
                      <th className={classes.num}>{t("finInsurerShare")}</th>
                      <th>{t("finInsurerDecision")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i, n) => {
                      const d = drafts[n] || { status: "accepted" as const, amount: "", reason: "" };
                      return (
                        <tr key={n}>
                          <td>{f.date(i.date)}</td>
                          <td className={classes.wrap}>{i.patient || "—"}</td>
                          <td className={classes.wrap}>{i.service || "—"}</td>
                          <td className={classes.num}>{f.money(i.share)}</td>
                          <td className={fin.decisionCol}>
                            {pending && canWrite ? (
                              <div className={fin.decisionCell}>
                                <select aria-label={t("finInsurerDecision")} value={d.status} onChange={(e) => set(n, { status: e.target.value as ClaimLineDecision })}>
                                  <option value="accepted">{t("finDecAccepted")}</option>
                                  <option value="deducted">{t("finDecDeducted")}</option>
                                  <option value="rejected">{t("finDecRejected")}</option>
                                </select>
                                {d.status === "deducted" && (
                                  <input
                                    aria-label={t("finDeductAmount")}
                                    placeholder={t("finDeductAmount")}
                                    value={d.amount}
                                    dir="ltr"
                                    inputMode="numeric"
                                    onChange={(e) => set(n, { amount: e.target.value })}
                                  />
                                )}
                                {d.status !== "accepted" && (
                                  <input
                                    aria-label={t("finDeductReason")}
                                    placeholder={t("finDeductReason")}
                                    list="fin-ded-reasons"
                                    value={d.reason}
                                    maxLength={300}
                                    onChange={(e) => set(n, { reason: e.target.value })}
                                  />
                                )}
                              </div>
                            ) : i.decision ? (
                              <>
                                <Pill status={lineTone(i.decision.status)}>{t(decisionKey(i.decision.status))}</Pill>
                                {i.decision.deducted > 0 && <span className={classes.negative}> −{f.money(i.decision.deducted)}</span>}
                                {i.decision.reason && <span className={fin.small}> · {i.decision.reason}</span>}
                              </>
                            ) : (
                              <span className={classes.muted}>{t("finRevPending")}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pending && canWrite ? (
                <label className={classes.field}>
                  <span>{t("finNote")}</span>
                  <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
                </label>
              ) : (
                !!review?.note && <p className={classes.muted}>{review.note}</p>
              )}
              {asArray(review?.payments).length > 0 && (
                <dl className={fin.kv}>
                  {asArray<NonNullable<typeof review>["payments"][number]>(review?.payments).map((p) => (
                    <div key={p._id}>
                      <dt>
                        {f.date(p.date)} · {p.moneyName || "—"}
                        {p.reference ? ` · ${p.reference}` : ""}
                      </dt>
                      <dd className={classes.positive}>{f.money(p.amount)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {!!sums.invalid && pending && <p className={fin.notice}>{t("finClaimInInvalid", [f.money(sums.invalid)])}</p>}
              {confirming && (
                <div className={classes.form}>
                  <div className={classes.field}>
                    <DateInput title={t("finDecisionDate")} defaultValue={date} onChange={(d) => setDate(d)} />
                  </div>
                  <p className={classes.muted}>{t("finClaimInDecideConfirm", [f.money(sums.approved), f.money(sums.deducted)])}</p>
                </div>
              )}
              <div className={classes.actions}>
                <button type="button" className={classes.ghost} onClick={exportCsv}>
                  {t("finExportCsv")}
                </button>
                {pending && canWrite && (
                  <>
                    <button type="button" className={classes.ghost} disabled={busy} onClick={() => setDrafts((d) => Object.fromEntries(Object.keys(d).map((k) => [k, { status: "accepted", amount: "", reason: "" }])))}>
                      {t("finAcceptAll")}
                    </button>
                    <button type="button" className={classes.ghost} disabled={busy || !!sums.invalid} onClick={() => save(false)}>
                      {t("finSaveDraft")}
                    </button>
                    {confirming ? (
                      <>
                        <button type="button" className={classes.ghost} onClick={() => setConfirming(false)}>
                          {t("bizCancel")}
                        </button>
                        <button type="button" className={classes.primary} disabled={busy || !!sums.invalid} onClick={() => save(true)}>
                          {t("finClaimInDecide")}
                        </button>
                      </>
                    ) : (
                      <button type="button" className={classes.primary} disabled={busy || !!sums.invalid} onClick={() => setConfirming(true)}>
                        {t("finClaimInDecide")}
                      </button>
                    )}
                  </>
                )}
              </div>
              {canWrite && review?.status === "decided" && data.open > 0 && <PayForm key={data.open} claim={data} onDone={changed} />}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

const Body = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const { open } = useFinPopup();
  const params = useSearchParams();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const query = new URLSearchParams({ ...(status ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) }).toString();
  const { data, error, mutate } = useSWR<List>(`${API}${api}/claims-in?${query}`, (url: string) => fetcher({ url }).then((res) => res.data as List), { keepPreviousData: true });
  const rows = asArray<Received>(data?.items);
  const view = (id: string) => open(VIEW_KEY, <ReviewView id={id} onChanged={() => mutate()} />);
  // a notification's link opens its list
  const opened = useRef(false);
  useEffect(() => {
    const claim = params?.get("claim");
    if (!opened.current && claim && /^[a-f0-9]{24}$/.test(claim)) {
      opened.current = true;
      view(claim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  const tile = (label: string, value?: number, unit = true) => (
    <div className={classes.tile}>
      <span className={classes.tileLabel}>{label}</span>
      <span className={classes.tileValue}>
        {f.money(value)}
        {unit && <span className={classes.tileUnit}>{t("toman")}</span>}
      </span>
    </div>
  );
  return (
    <>
      <div className={classes.tiles}>
        {tile(t("finClaimInPendingN", [f.money(data?.totals.pending.count)]), data?.totals.pending.amount)}
        {tile(t("finClaimInPayableN", [f.money(data?.totals.payable.count)]), data?.totals.payable.amount)}
        {tile(t("finClaimInPaidTotal"), data?.totals.paid)}
      </div>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {["", "pending", "decided", "paid"].map((s) => (
              <button key={s || "all"} type="button" role="tab" aria-selected={status === s} className={status === s ? classes.on : ""} onClick={() => setStatus(s)}>
                {t(s === "pending" ? "finRevPending" : s === "decided" ? "finRevDecided" : s === "paid" ? "finRevPaid" : "finAll")}
              </button>
            ))}
          </div>
          <div className={classes.filters}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("bizSearch")} aria-label={t("bizSearch")} />
          </div>
        </div>
        <p className={classes.muted}>{t("finClaimsInHint")}</p>
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (rows.length === 0 ? (
              <p className={classes.empty}>{t("finNoClaimsIn")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizNumber")}</th>
                      <th>{t("finCentre")}</th>
                      <th>{t("finSubmittedOn")}</th>
                      <th className={classes.num}>{t("finLines")}</th>
                      <th className={classes.num}>{t("finClaimed")}</th>
                      <th className={classes.num}>{t("finApproved")}</th>
                      <th className={classes.num}>{t("finDeducted")}</th>
                      <th className={classes.num}>{t("finClaimInOpen")}</th>
                      <th>{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c._id} className={classes.rowLink} tabIndex={0} onClick={() => view(c._id)} onKeyDown={(e) => e.key === "Enter" && view(c._id)}>
                        <td>{f.year(c.number)}</td>
                        <td className={classes.wrap}>{c.centreName || "—"}</td>
                        <td>{c.submittedAt ? f.date(c.submittedAt) : "—"}</td>
                        <td className={classes.num}>{f.money(c.lines || 0)}</td>
                        <td className={classes.num}>{f.money(c.claimed)}</td>
                        <td className={classes.num}>{c.review?.status === "pending" ? "—" : f.money(c.review?.approved)}</td>
                        <td className={`${classes.num} ${(c.review?.deducted || 0) > 0 ? classes.negative : ""}`}>{c.review?.status === "pending" ? "—" : f.money(c.review?.deducted)}</td>
                        <td className={classes.num}>{f.money(c.open)}</td>
                        <td>
                          <Pill status={reviewTone(c.review)}>{t(reviewKey(c.review))}</Pill>
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

const InsurerClaims = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finClaimsInTitle" subtitle="finClaimsInSubtitle" segment="claims">
    <Body />
  </FinanceShell>
);

export default InsurerClaims;
