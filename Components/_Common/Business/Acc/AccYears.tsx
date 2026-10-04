"use client";

import { useState } from "react";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import AccountingYears from "../AccountingYears";
import { parseAmount } from "../Finance/finShared";
import { AccParty, PartyPicker, SubNav, useAccCall, useAccText, useAccUpload, useView } from "./accShared";

// The fiscal year (2026-10): the existing year-end close and reopening
// (AccountingYears - now carrying every patient's, insurer's and supplier's
// balance across the year, per تفصیلی), and the opening balances of a
// practice that starts its books here (Nexxa importOpeningBalances: rows of
// account / debit / credit, typed or from Excel; codes not in the chart are
// skipped and the difference is balanced on «تراز افتتاحیه» 5103).

type Row = { account: string; party: AccParty | null; debit: string; credit: string };
const empty = (): Row => ({ account: "", party: null, debit: "", credit: "" });

const Opening = ({ onChanged }: { onChanged: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const call = useAccCall();
  const upload = useAccUpload();
  const { data } = useBizAccounts();
  const accounts = asArray<BizAccount>(data).filter((a) => a.level === "detail" && ["asset", "liability", "equity"].includes(a.type) && a.isActive !== false && a.role !== "openingBalance");
  const [rows, setRows] = useState<Row[]>([empty(), empty(), empty()]);
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  const [result, setResult] = useState<{ posted: number; skipped: string[]; balancedBy: number } | null>(null);
  const d = rows.reduce((s, r) => s + parseAmount(r.debit), 0);
  const c = rows.reduce((s, r) => s + parseAmount(r.credit), 0);
  const set = (i: number, patch: Partial<Row>) => setRows((p) => p.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const done = (r: unknown) => {
    if (!r) return;
    setResult(r as { posted: number; skipped: string[]; balancedBy: number });
    setRows([empty(), empty(), empty()]);
    onChanged();
  };
  const save = async () =>
    done(
      await call(
        "/acc/opening",
        "POST",
        {
          date: isoDay(date),
          rows: rows.filter((r) => r.account && (parseAmount(r.debit) || parseAmount(r.credit))).map((r) => ({ account: r.account, party: r.party?._id, debit: parseAmount(r.debit), credit: parseAmount(r.credit) })),
        },
        t("accOpeningPosted"),
      ),
    );
  return (
    <section className={classes.card}>
      <p className={classes.muted}>{t("accOpeningHint")}</p>
      <div className={classes.form}>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
      </div>
      <div className={classes.lines}>
        {rows.map((r, i) => {
          const a = accounts.find((x) => x._id === r.account);
          return (
            <div key={i} className={acc.editLine} style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1.5fr) 8rem 8rem 2.25rem" }}>
              <select value={r.account} aria-label={t("bizAccount")} onChange={(e) => set(i, { account: e.target.value })}>
                <option value="">{t("bizSelect")}</option>
                {accounts.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.code} · {x.name}
                  </option>
                ))}
              </select>
              <PartyPicker value={r.party} kinds={a?.tafsiliKinds?.length ? a.tafsiliKinds : undefined} onChange={(p) => set(i, { party: p })} />
              <input inputMode="numeric" dir="ltr" placeholder={t("bizDebit")} value={r.debit} aria-label={t("bizDebit")} onChange={(e) => set(i, { debit: e.target.value, credit: e.target.value ? "" : r.credit })} />
              <input inputMode="numeric" dir="ltr" placeholder={t("bizCredit")} value={r.credit} aria-label={t("bizCredit")} onChange={(e) => set(i, { credit: e.target.value, debit: e.target.value ? "" : r.debit })} />
              <button type="button" className={classes.removeLine} disabled={rows.length <= 1} aria-label={t("bizDelete")} onClick={() => setRows((p) => p.filter((_, j) => j !== i))}>
                ×
              </button>
            </div>
          );
        })}
      </div>
      <div className={acc.bar}>
        <div className={acc.tools}>
          <button type="button" onClick={() => setRows((p) => [...p, empty()])}>
            {t("bizAddLine")}
          </button>
          <label className={acc.chip} style={{ cursor: "pointer" }}>
            {t("accOpeningImport")}
            <input type="file" hidden accept=".csv,.xlsx" onChange={async (e) => e.target.files?.[0] && done(await upload("/acc/opening/file", { file: e.target.files[0], date: isoDay(date) }))} />
          </label>
        </div>
        <span className={Math.abs(d - c) < 0.5 ? classes.statusOk : classes.muted}>
          {t("bizDebit")}: {f.money(d)} · {t("bizCredit")}: {f.money(c)} · {Math.abs(d - c) < 0.5 ? t("bizBalanced") : t("accOpeningDiff", [f.money(Math.abs(d - c))])}
        </span>
        <button type="button" className={classes.primary} disabled={!d && !c} onClick={save}>
          {t("accPostOpening")}
        </button>
      </div>
      <p className={acc.mutedSmall}>{t("accOpeningFileHint")}</p>
      {!!result && <p className={classes.statusOk}>{t("accOpeningResult", [String(result.posted), String(asArray(result.skipped).length), f.money(Math.abs(result.balancedBy || 0))])}</p>}
    </section>
  );
};

const VIEWS = ["years", "opening"] as const;

const AccYears = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useAccText();
  const { canApprove } = useBiz();
  const [view, setView] = useView(VIEWS, "years");
  return (
    <div className={classes.main}>
      {canApprove && (
        <SubNav
          value={view}
          onChange={setView}
          items={[
            ["years", t("bizTabYears")],
            ["opening", t("accOpeningBalances")],
          ]}
        />
      )}
      {(view === "years" || !canApprove) && <AccountingYears refreshKey={refreshKey} onChanged={onChanged} />}
      {view === "opening" && canApprove && <Opening onChanged={onChanged} />}
    </div>
  );
};

export default AccYears;
