"use client";

import { useEffect, useRef, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import acc from "./Acc.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { useCostCenters } from "../CostCenterSelect";
import { ExportBar, RangeFilter, rangeQs, SimplePopup, SubNav, useAccGet, useAccPopup, useAccText } from "./accShared";
import { LedgerView } from "./AccBooks";

// The trial balance (2026-10), after Nexxa's accounting/trial-balance:
// 2, 4, 6 or 8 columns at the group, total or detail level - and here per
// تفصیلی too: opening (before the range), the range's turnover, the
// cumulative turnover and the closing balance, each as debit / credit.

type Row = {
  code: string;
  name: string;
  account?: string;
  party?: string;
  openDebit: number;
  openCredit: number;
  turnDebit: number;
  turnCredit: number;
  cumDebit: number;
  cumCredit: number;
  closeDebit: number;
  closeCredit: number;
};
type Key = Exclude<keyof Row, "code" | "name" | "account" | "party">;
const LEVELS = ["group", "total", "detail", "party"] as const;
const COLS = [2, 4, 6, 8] as const;

const AccTrial = ({ refreshKey }: { refreshKey: number }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("total");
  const [cols, setCols] = useState<(typeof COLS)[number]>(6);
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [center, setCenter] = useState("");
  const { data: centers } = useCostCenters();
  const { data, error, mutate } = useAccGet<{ rows: Row[]; balanced: boolean }>(`/acc/trial?${rangeQs(from, to, { level, center: center || undefined })}`, (d) => {
    const x = (d || {}) as { rows?: unknown; balanced?: boolean };
    return { rows: asArray<Row>(x.rows), balanced: !!x.balanced };
  });
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const groups: { label: string; keys: [Key, Key] }[] = [
    { label: t("accTrialOpening"), keys: ["openDebit", "openCredit"] },
    { label: t("accTrialTurnover"), keys: ["turnDebit", "turnCredit"] },
    { label: t("accTrialCumulative"), keys: ["cumDebit", "cumCredit"] },
    { label: t("accTrialClosing"), keys: ["closeDebit", "closeCredit"] },
  ];
  const shown = cols === 2 ? [groups[3]] : cols === 4 ? [groups[1], groups[3]] : cols === 6 ? [groups[0], groups[1], groups[3]] : groups;
  const rows = asArray<Row>(data?.rows);
  const total = (k: Key) => rows.reduce((s, r) => s + (r[k] || 0), 0);
  const levelLabel = { group: t("accLevelGroup"), total: t("accLevelTotal"), detail: t("accLevelDetail"), party: t("accLevelParty") };
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <SubNav value={level} onChange={setLevel} items={LEVELS.map((l) => [l, levelLabel[l]] as [(typeof LEVELS)[number], string])} />
        <SubNav value={String(cols) as "2"} onChange={(c) => setCols(Number(c) as 2)} items={COLS.map((c) => [String(c), t("accColumns", [f.money(c)])] as ["2", string])} />
      </div>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo}>
        {level !== "party" && (
          <label className={classes.field}>
            <span>{t("bizCostCenter")}</span>
            <select value={center} onChange={(e) => setCenter(e.target.value)}>
              <option value="">{t("accAll")}</option>
              {asArray<{ _id: string; name: string }>(centers).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </RangeFilter>
      <ExportBar
        printRef={ref}
        sheet={() => ({
          title: `${t("bizTrialBalance")} · ${levelLabel[level]}`,
          head: [t("bizCode"), t("bizName"), ...shown.flatMap((g) => [`${g.label} - ${t("bizDebit")}`, `${g.label} - ${t("bizCredit")}`])],
          rows: rows.map((r) => [r.code, r.name, ...shown.flatMap((g) => g.keys.map((k) => Math.round(r[k] || 0)))]),
        })}
      />
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr className={acc.groupHead}>
                <th rowSpan={2}>{t("bizCode")}</th>
                <th rowSpan={2}>{t("bizName")}</th>
                {shown.map((g) => (
                  <th key={g.label} colSpan={2}>
                    {g.label}
                  </th>
                ))}
              </tr>
              <tr>
                {shown.flatMap((g) => [
                  <th key={`${g.label}d`} className={classes.num}>
                    {t("bizDebit")}
                  </th>,
                  <th key={`${g.label}c`} className={classes.num}>
                    {t("bizCredit")}
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={2 + shown.length * 2} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr
                  key={r.code + (r.party || "")}
                  className={classes.rowLink}
                  onClick={() =>
                    open(
                      "AccLedger",
                      <SimplePopup title={`${r.code} · ${r.name}`} wide>
                        <LedgerView fixed={{ account: r.account, party: r.party, partyName: r.party ? r.name : undefined }} />
                      </SimplePopup>,
                    )
                  }
                >
                  <td>{r.code}</td>
                  <td className={classes.wrap}>{r.name}</td>
                  {shown.flatMap((g) => g.keys.map((k) => <td key={k} className={classes.num}>{r[k] ? f.money(r[k]) : "—"}</td>))}
                </tr>
              ))}
              <tr className={classes.footRow}>
                <td colSpan={2}>
                  {t("bizTotal")}{" "}
                  {level !== "party" && <span className={data?.balanced ? classes.statusOk : classes.statusBad}>({data?.balanced ? t("bizIsBalanced") : t("bizNotBalanced")})</span>}
                </td>
                {shown.flatMap((g) => g.keys.map((k) => <td key={k} className={classes.num}>{f.money(total(k))}</td>))}
              </tr>
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

export default AccTrial;
