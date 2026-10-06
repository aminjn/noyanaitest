"use client";
import { tehranTodayPicker } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import DateInput from "@/Components/UI/DateInput";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import AccountingReports from "../AccountingReports";
import FinanceShell from "./FinanceShell";
import { AccProfileIncome } from "../Acc/AccProfile";
import { downloadCsv, insurerKey, useFin, useFinText, useTabParam } from "./finShared";

type Breakdown = {
  byService: { title: string; count: number; net: number; tax: number }[];
  byDoctor: { name: string; count: number; total: number; paid: number }[];
  byInsurer: { kind: string; name: string; count: number; share: number; total: number }[];
  bySource: { origin: string; count: number; total: number }[];
  totals: { count: number; total: number; tax: number; discount: number; insurer: number };
};
type AgingRow = { name: string; phone?: string; kind?: string; count?: number; d30: number; d60: number; d90: number; older: number; total: number };
type Aging = { patients: AgingRow[]; insurers: AgingRow[]; patientTotals: AgingRow; insurerTotals: AgingRow };

// the first day of this Jalali month (as Tehran sees it): the breakdown's
// default period, the month the practice reports in
const monthStart = () => {
  const now = new Date();
  const day = Number(new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", { day: "numeric", timeZone: "Asia/Tehran" }).format(now)) || 1;
  // Tehran's today, day - 1 days back, as the picker's value
  return tehranTodayPicker(-(day - 1));
};

const ShareTable = <T,>({
  title,
  rows,
  cols,
  value,
  csv,
}: {
  title: string;
  rows: T[];
  cols: { head: string; cell: (r: T) => string | number; num?: boolean }[];
  value: (r: T) => number;
  csv: string;
}) => {
  const t = useFinText();
  const max = Math.max(1, ...rows.map(value));
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{title}</span>
        <button type="button" className={classes.ghost} disabled={!rows.length} onClick={() => downloadCsv(csv, [cols.map((c) => c.head), ...rows.map((r) => cols.map((c) => c.cell(r)))])}>
          {t("finExportCsv")}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className={classes.empty}>{t("bizEmpty")}</p>
      ) : (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c.head} className={c.num ? classes.num : ""}>
                    {c.head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {cols.map((c, j) => (
                    <td key={c.head} className={c.num ? classes.num : classes.wrap}>
                      {c.cell(r)}
                      {j === 0 && <span className={fin.shareBar} style={{ width: `${(value(r) / max) * 100}%` }} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const IncomeBreakdown = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, node } = useFin();
  const [from, setFrom] = useState<Date | null>(monthStart());
  const [to, setTo] = useState<Date | null>(null);
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (from) p.set("from", isoDay(from));
    if (to) p.set("to", isoDay(to));
    return p.toString();
  }, [from, to]);
  const { data, error } = useSWR<Breakdown>(`${API}${api}/reports/breakdown?${query}`, (url: string) => fetcher({ url }).then((res) => res.data as Breakdown));
  return (
    <div className={classes.main}>
      <div className={classes.filters}>
        <DateInput title={t("bizFrom")} defaultValue={from || undefined} onChange={(d) => setFrom(d)} onClear={() => setFrom(null)} />
        <DateInput title={t("bizTo")} onChange={(d) => setTo(d)} onClear={() => setTo(null)} />
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tiles}>
              <div className={`${classes.tile} ${classes.primaryTile}`}>
                <span className={classes.tileLabel}>{t("finInvoicedTotal")}</span>
                <span className={classes.tileValue}>
                  {f.money(data.totals.total)}
                  <span className={classes.tileUnit}>{t("toman")}</span>
                </span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("finInvoiceCount")}</span>
                <span className={classes.tileValue}>{f.money(data.totals.count)}</span>
              </div>
              {asArray<Breakdown["bySource"][number]>(data.bySource).map((s) => (
                <div key={s.origin} className={classes.tile}>
                  <span className={classes.tileLabel}>{t(s.origin === "platform" ? "finOriginPlatform" : "finOriginManual")}</span>
                  <span className={classes.tileValue}>
                    {f.money(s.total)}
                    <span className={classes.tileUnit}>{t("toman")}</span>
                  </span>
                </div>
              ))}
              {node !== "insurance" && (
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("finInsurerShare")}</span>
                  <span className={classes.tileValue}>
                    {f.money(data.totals.insurer)}
                    <span className={classes.tileUnit}>{t("toman")}</span>
                  </span>
                </div>
              )}
            </div>
            <ShareTable
              title={t("finByService")}
              csv="income-by-service"
              rows={asArray<Breakdown["byService"][number]>(data.byService)}
              value={(r) => r.net}
              cols={[
                { head: t("finService"), cell: (r) => r.title },
                { head: t("finQty"), cell: (r) => f.money(r.count), num: true },
                { head: t("finNetAmount"), cell: (r) => f.money(r.net), num: true },
                { head: t("finTax"), cell: (r) => f.money(r.tax), num: true },
              ]}
            />
            {node !== "doctor" && (
              <ShareTable
                title={t("finByDoctor")}
                csv="income-by-doctor"
                rows={asArray<Breakdown["byDoctor"][number]>(data.byDoctor)}
                value={(r) => r.total}
                cols={[
                  { head: t("finDoctorName"), cell: (r) => r.name || t("finNoDoctor") },
                  { head: t("finInvoiceCount"), cell: (r) => f.money(r.count), num: true },
                  { head: t("bizTotal"), cell: (r) => f.money(r.total), num: true },
                  { head: t("invPaid"), cell: (r) => f.money(r.paid), num: true },
                ]}
              />
            )}
            {node !== "insurance" && (
              <ShareTable
                title={t("finByInsurer")}
                csv="income-by-insurer"
                rows={asArray<Breakdown["byInsurer"][number]>(data.byInsurer)}
                value={(r) => r.share}
                cols={[
                  { head: t("finInsurer"), cell: (r) => `${r.name} (${t(insurerKey(r.kind))})` },
                  { head: t("finInvoiceCount"), cell: (r) => f.money(r.count), num: true },
                  { head: t("bizTotal"), cell: (r) => f.money(r.total), num: true },
                  { head: t("finInsurerShare"), cell: (r) => f.money(r.share), num: true },
                ]}
              />
            )}
          </>
        )}
      </HandleLoading>
    </div>
  );
};

const AgingTable = ({ title, rows, totals, csv, kind }: { title: string; rows: AgingRow[]; totals: AgingRow; csv: string; kind: "patient" | "insurer" }) => {
  const t = useFinText();
  const f = useBizFormat();
  const heads = [t(kind === "patient" ? "finPatientName" : "finInsurer"), t("finAge30"), t("finAge60"), t("finAge90"), t("finAgeOlder"), t("bizTotal")];
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{title}</span>
        <button
          type="button"
          className={classes.ghost}
          disabled={!rows.length}
          onClick={() => downloadCsv(csv, [heads, ...rows.map((r) => [kind === "patient" ? `${r.name} ${r.phone || ""}`.trim() : r.name, r.d30, r.d60, r.d90, r.older, r.total])])}
        >
          {t("finExportCsv")}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className={classes.empty}>{t("finNothingOwed")}</p>
      ) : (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                {heads.map((h, i) => (
                  <th key={h} className={i ? classes.num : ""}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={classes.wrap}>
                    {r.name || "—"}
                    {kind === "patient" && r.phone ? (
                      <span className={fin.small} dir="ltr">
                        {" "}
                        · {r.phone}
                      </span>
                    ) : kind === "insurer" ? (
                      <span className={fin.small}> ({t(insurerKey(r.kind))})</span>
                    ) : null}
                  </td>
                  <td className={classes.num}>{f.money(r.d30)}</td>
                  <td className={classes.num}>{f.money(r.d60)}</td>
                  <td className={classes.num}>{f.money(r.d90)}</td>
                  <td className={`${classes.num} ${r.older > 0 ? classes.negative : ""}`}>{f.money(r.older)}</td>
                  <td className={classes.num}>{f.money(r.total)}</td>
                </tr>
              ))}
              <tr className={classes.footRow}>
                <td>{t("bizTotal")}</td>
                <td className={classes.num}>{f.money(totals?.d30)}</td>
                <td className={classes.num}>{f.money(totals?.d60)}</td>
                <td className={classes.num}>{f.money(totals?.d90)}</td>
                <td className={classes.num}>{f.money(totals?.older)}</td>
                <td className={classes.num}>{f.money(totals?.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const AgingReport = () => {
  const t = useFinText();
  const { api, node } = useFin();
  const { data, error } = useSWR<Aging>(`${API}${api}/reports/aging`, (url: string) => fetcher({ url }).then((res) => res.data as Aging));
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <AgingTable title={t("finAgingPatients")} rows={asArray<AgingRow>(data.patients)} totals={data.patientTotals} csv="aging-patients" kind="patient" />
          {node !== "insurance" && (
            <AgingTable title={t("finAgingInsurers")} rows={asArray<AgingRow>(data.insurers)} totals={data.insurerTotals} csv="aging-insurers" kind="insurer" />
          )}
        </div>
      )}
    </HandleLoading>
  );
};

const Body = ({ node }: { node: NodeWithAcl }) => {
  const t = useFinText();
  const view = useTabParam("profile");
  return (
    <ClientTabSystem
      viewState={view}
      items={[
        // (2026-10) income in the profile's own grouping first: a doctor's
        // visit types, a pharmacy's drug classes and insurers, a lab's
        // sections, a hospital's wards (Acc/AccProfile.tsx)
        { id: "profile", title: t(`accIncomeBy_${node}`), content: <AccProfileIncome node={node} /> },
        { id: "statements", title: t("finTabStatements"), content: <AccountingReports refreshKey={0} /> },
        { id: "income", title: t("finTabIncome"), content: <IncomeBreakdown /> },
        { id: "aging", title: t("finAging"), content: <AgingReport /> },
      ]}
    />
  );
};

// «مالی و حسابداری» → گزارش‌ها (2026-10): the statements (profit and loss,
// balance sheet, cash flow, trial balance, cost centres - the accounting
// engine's own), income by service, doctor and insurer, and what patients
// and insurers owe by age; every table exports to CSV.
const FinanceReports = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finReportsTitle" subtitle="finReportsSubtitle" segment="reports">
    <Body node={node} />
  </FinanceShell>
);

export default FinanceReports;
