"use client";

import { useRef, useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, useBizFormat } from "../bizShared";
import AccountingVat from "../AccountingVat";
import { ExportBar, SubNav, useAccGet, useAccText, useView } from "./accShared";

// Tax (2026-10), after Nexxa's accounting/tax: the quarterly VAT return
// (the existing «ارزش افزوده» tab, with its settlement and payment) and the
// seasonal transactions lists of ماده‌ی ۱۶۹ - purchases and sales grouped
// by the party's national id or economic code (never by name), each row
// marked when it lacks the id the system needs.

type PartyRow = { key: string; name: string; nationalId: string; economicCode: string; count: number; amount: number; vat: number; complete: boolean };
type Seasonal = { vat: { taxableSales: number; outputVat: number; taxablePurchases: number; inputVat: number; vatPayable: number; creditCarryforward: number }; sales: PartyRow[]; purchases: PartyRow[] };

const jalaliNow = () => {
  // the Jalali year and quarter of today, via Intl (Persian calendar)
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-persian", { year: "numeric", month: "numeric", timeZone: "Asia/Tehran" }).formatToParts(new Date());
    const y = Number(parts.find((p) => p.type === "year")?.value);
    const m = Number(parts.find((p) => p.type === "month")?.value);
    return { year: y || 1405, quarter: Math.min(4, Math.max(1, Math.ceil((m || 1) / 3))) };
  } catch {
    return { year: 1405, quarter: 1 };
  }
};

const List = ({ title, rows }: { title: string; rows: PartyRow[] }) => {
  const t = useAccText();
  const f = useBizFormat();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={classes.main}>
      <div className={acc.bar}>
        <h3 className={classes.cardTitle}>{title}</h3>
        <ExportBar
          printRef={ref}
          sheet={() => ({
            title,
            head: [t("bizName"), t("accNationalId"), t("accEconomicCode"), t("accDocCount"), t("accAmountExVat"), t("bizVatAmount")],
            rows: rows.map((r) => [r.name, r.nationalId, r.economicCode, r.count, Math.round(r.amount), Math.round(r.vat)]),
          })}
        />
      </div>
      <div className={classes.tableWrap} ref={ref}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("bizName")}</th>
              <th>{t("accNationalId")}</th>
              <th>{t("accEconomicCode")}</th>
              <th className={classes.num}>{t("accDocCount")}</th>
              <th className={classes.num}>{t("accAmountExVat")}</th>
              <th className={classes.num}>{t("bizVatAmount")}</th>
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={6} className={classes.empty}>
                  {t("bizEmpty")}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.key}>
                <td className={classes.wrap}>
                  {r.name || "—"} {!r.complete && <span className={`${fin.pill} ${fin.toneWarn}`}>{t("accNoTaxId")}</span>}
                </td>
                <td dir="ltr">{r.nationalId || "—"}</td>
                <td dir="ltr">{r.economicCode || "—"}</td>
                <td className={classes.num}>{f.money(r.count)}</td>
                <td className={classes.num}>{f.money(r.amount)}</td>
                <td className={classes.num}>{f.money(r.vat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SeasonalView = () => {
  const t = useAccText();
  const f = useBizFormat();
  const now = jalaliNow();
  const [year, setYear] = useState(now.year);
  const [quarter, setQuarter] = useState(now.quarter);
  const { data, error } = useAccGet<Seasonal | null>(`/acc/seasonal?year=${year}&quarter=${quarter}`, (d) => (d && typeof d === "object" ? (d as Seasonal) : null));
  return (
    <div className={classes.main}>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("bizFiscalYearCol")}</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[now.year, now.year - 1, now.year - 2].map((y) => (
              <option key={y} value={y}>
                {f.year(y)}
              </option>
            ))}
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("accQuarter")}</span>
          <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                {t(`bizVatQ${q}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className={classes.muted}>{t("accSeasonalHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accTaxableSales")}</span>
                <span className={classes.tileValue}>{f.money(data.vat.taxableSales)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("bizVatOutput")}</span>
                <span className={classes.tileValue}>{f.money(data.vat.outputVat)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accTaxablePurchases")}</span>
                <span className={classes.tileValue}>{f.money(data.vat.taxablePurchases)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("bizVatCreditable")}</span>
                <span className={classes.tileValue}>{f.money(data.vat.inputVat)}</span>
              </div>
            </div>
            <List title={t("accSeasonalPurchases")} rows={asArray<PartyRow>(data.purchases)} />
            <List title={t("accSeasonalSales")} rows={asArray<PartyRow>(data.sales)} />
          </>
        )}
      </HandleLoading>
    </div>
  );
};

const VIEWS = ["vat", "seasonal"] as const;

const AccTax = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useAccText();
  const [view, setView] = useView(VIEWS, "vat");
  return (
    <div className={classes.main}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["vat", t("bizTabVat")],
          ["seasonal", t("accSeasonal")],
        ]}
      />
      {view === "vat" && <AccountingVat refreshKey={refreshKey} onChanged={onChanged} />}
      {view === "seasonal" && (
        <section className={classes.card}>
          <SeasonalView />
        </section>
      )}
    </div>
  );
};

export default AccTax;
