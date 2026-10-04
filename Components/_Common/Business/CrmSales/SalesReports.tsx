"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { isoDay, useBizFormat } from "../bizShared";
import { insurerKey, sourceKey, useCrm, useCrmText, usePercent } from "../Crm/crmShared";
import { leadKindKey, leadStatusKey, planStatusKey, SalesMeta, useAction, useList, useNames, useSalesMeta } from "./salesShared";

type Group = { key: string; count: number; won: number; lost: number; value: number; wonValue: number };
type Report = {
  count: number;
  openValue: number;
  weighted: number;
  wonValue: number;
  lostValue: number;
  winRate: number;
  cycleDays: number | null;
  byAssignee: Group[];
  byKind: Group[];
  bySource: Group[];
  lossReasons: Group[];
  topServices: { title: string; qty: number; value: number }[];
};
type Row = { key: string; count: number; sum: number };
type Saved = { _id: string; name: string; entity: "lead" | "contact" | "plan"; config: Record<string, string> };

const groupBys: Record<string, string[]> = {
  lead: ["status", "kind", "stage", "sourceName", "assignee", "priority", "lostReason", "month"],
  contact: ["source", "insurer", "city", "gender", "tags", "month"],
  plan: ["status", "createdBy", "month"],
};

const Bars = ({ rows, label, value }: { rows: Group[]; label: (k: string) => string; value: (g: Group) => number }) => {
  const f = useBizFormat();
  const max = Math.max(1, ...rows.map(value));
  return (
    <div className={s.bars}>
      {rows.slice(0, 10).map((g) => (
        <div key={g.key} className={s.barRow}>
          <span>{label(g.key)}</span>
          <div className={s.barTrack}>
            <div className={s.barFill} style={{ width: `${(value(g) / max) * 100}%` }} />
          </div>
          <span className={classes.muted}>{f.money(value(g))}</span>
        </div>
      ))}
    </div>
  );
};

const Standard = ({ meta }: { meta?: SalesMeta }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const pct = usePercent();
  const names = useNames();
  const { api } = useCrm();
  const [from, setFrom] = useState(isoDay(new Date(Date.now() - 90 * 864e5)));
  const [to, setTo] = useState(isoDay(new Date()));
  const { data, error } = useSWR<Report>(`${API}${api}/sales/report?from=${from}&to=${to}`, (url: string) => fetcher({ url }).then((res) => res.data as Report));
  return (
    <div className={s.stack}>
      <div className={classes.filters}>
        <label className={classes.field}>
          {t("crmsFrom")}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className={classes.field}>
          {t("crmsTo")}
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsLeadsCount")}</span>
                <span className={classes.tileValue}>{f.money(data.count)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsOpenFunnel")}</span>
                <span className={classes.tileValue}>{f.money(data.openValue)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsWeighted")}</span>
                <span className={classes.tileValue}>{f.money(data.weighted)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsWonValue")}</span>
                <span className={classes.tileValue}>{f.money(data.wonValue)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsLostValue")}</span>
                <span className={classes.tileValue}>{f.money(data.lostValue)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsWinRate")}</span>
                <span className={classes.tileValue}>{pct(Math.round(data.winRate * 1000), 1000)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmsCycleDays")}</span>
                <span className={classes.tileValue}>{data.cycleDays === null ? "—" : f.money(data.cycleDays)}</span>
              </div>
            </div>
            <div className={s.twoCol}>
              <section className={classes.card}>
                <h3 className={classes.cardTitle}>{t("crmsByStaff")}</h3>
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("crmsStaffMember")}</th>
                        <th>{t("crmsLeadsCount")}</th>
                        <th>{t("crmsLeadWon")}</th>
                        <th>{t("crmsLeadLost")}</th>
                        <th>{t("crmsWonValue")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byAssignee.map((g) => (
                        <tr key={g.key}>
                          <td>{g.key ? names.staff(meta, g.key) : t("crmsUnassigned")}</td>
                          <td className={classes.num}>{f.money(g.count)}</td>
                          <td className={classes.num}>{f.money(g.won)}</td>
                          <td className={classes.num}>{f.money(g.lost)}</td>
                          <td className={classes.num}>{f.money(g.wonValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className={classes.card}>
                <h3 className={classes.cardTitle}>{t("crmsLossReasons")}</h3>
                {data.lossReasons.length ? <Bars rows={data.lossReasons} label={(k) => k || "—"} value={(g) => g.count} /> : <p className={classes.muted}>{t("crmsNothingYet")}</p>}
              </section>
              <section className={classes.card}>
                <h3 className={classes.cardTitle}>{t("crmsByKind")}</h3>
                <Bars rows={data.byKind} label={(k) => t(leadKindKey(k))} value={(g) => g.value} />
              </section>
              <section className={classes.card}>
                <h3 className={classes.cardTitle}>{t("crmsBySource")}</h3>
                <Bars rows={data.bySource} label={(k) => k || "—"} value={(g) => g.count} />
              </section>
            </div>
            <section className={classes.card}>
              <h3 className={classes.cardTitle}>{t("crmsTopServices")}</h3>
              {data.topServices.length ? (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("crmsService")}</th>
                        <th>{t("crmsQty")}</th>
                        <th>{t("crmsValue")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topServices.map((x) => (
                        <tr key={x.title}>
                          <td className={classes.wrap}>{x.title}</td>
                          <td className={classes.num}>{f.money(x.qty)}</td>
                          <td className={classes.num}>{f.money(x.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={classes.muted}>{t("crmsNothingYet")}</p>
              )}
            </section>
          </>
        )}
      </HandleLoading>
    </div>
  );
};

// the report builder (Nexxa crm/reports/builder): an entity, a grouping, a
// measure and a status filter, run now or saved for later
const Builder = ({ meta }: { meta?: SalesMeta }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const names = useNames();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const { data: saved, mutate } = useList<Saved>("/sales/reports");
  const [entity, setEntity] = useState<Saved["entity"]>("lead");
  const [groupBy, setGroupBy] = useState("status");
  const [measure, setMeasure] = useState<"count" | "sum">("count");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [name, setName] = useState("");
  const stages = (meta?.pipelines || []).flatMap((p) => p.stages);
  const label = (k: string) => {
    if (!k) return "—";
    if (groupBy === "status") return t(entity === "plan" ? planStatusKey[k as keyof typeof planStatusKey] || k : leadStatusKey[k as keyof typeof leadStatusKey] || k);
    if (groupBy === "kind") return t(leadKindKey(k));
    if (groupBy === "stage") return names.stage(stages.find((x) => x._id === k));
    if (groupBy === "assignee" || groupBy === "createdBy") return names.staff(meta, k);
    if (groupBy === "priority") return t(`crmsPriority_${k}`);
    if (groupBy === "source") return t(sourceKey[k as keyof typeof sourceKey] || k);
    if (groupBy === "insurer") return t(insurerKey[k as keyof typeof insurerKey] || k);
    if (groupBy === "gender") return t(k === "male" ? "crmsMale" : "crmsFemale");
    return k;
  };
  const exec = async (cfg?: { entity: Saved["entity"]; groupBy: string; measure: "count" | "sum"; status: string }) => {
    const c = cfg || { entity, groupBy, measure, status };
    const r = await run<Row[]>("POST", "/sales/report/run", { ...c, status: c.status || undefined }, { quiet: true });
    if (r) setRows(r);
  };
  const statuses = entity === "lead" ? ["open", "won", "lost"] : entity === "plan" ? ["draft", "sent", "accepted", "declined", "revised"] : [];
  const max = Math.max(1, ...(rows || []).map((r) => (measure === "sum" ? r.sum : r.count)));
  return (
    <div className={s.stack}>
      <section className={classes.card}>
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsEntity")}
            <select
              value={entity}
              onChange={(e) => {
                const v = e.target.value as Saved["entity"];
                setEntity(v);
                setGroupBy(groupBys[v][0]);
                setStatus("");
                setRows(null);
              }}
            >
              {(["lead", "contact", "plan"] as const).map((x) => (
                <option key={x} value={x}>
                  {t(`crmsEntity_${x}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsGroupBy")}
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              {groupBys[entity].map((g) => (
                <option key={g} value={g}>
                  {t(`crmsGb_${g}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsMeasure")}
            <select value={measure} onChange={(e) => setMeasure(e.target.value as "count" | "sum")}>
              <option value="count">{t("crmsMeasureCount")}</option>
              <option value="sum">{t(entity === "contact" ? "crmsMeasureSpent" : "crmsMeasureValue")}</option>
            </select>
          </label>
          {statuses.length > 0 && (
            <label className={classes.field}>
              {t("crmsStatus")}
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">{t("crmsAllStatuses")}</option>
                {statuses.map((x) => (
                  <option key={x} value={x}>
                    {t(entity === "plan" ? planStatusKey[x as keyof typeof planStatusKey] : leadStatusKey[x as keyof typeof leadStatusKey])}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy} onClick={() => exec()}>
            {t("crmsRun")}
          </button>
          {canWrite && (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("crmsReportName")} aria-label={t("crmsReportName")} />
              <button
                type="button"
                className={classes.ghost}
                disabled={!!busy || !name.trim()}
                onClick={async () => {
                  if (await run("POST", "/sales/reports", { name, entity, config: { groupBy, measure, status } })) {
                    setName("");
                    mutate();
                  }
                }}
              >
                {t("crmsSaveReport")}
              </button>
            </>
          )}
        </div>
        {rows &&
          (rows.length ? (
            <div className={s.bars}>
              {rows.map((r) => (
                <div key={r.key} className={s.barRow}>
                  <span>{label(r.key)}</span>
                  <div className={s.barTrack}>
                    <div className={s.barFill} style={{ width: `${((measure === "sum" ? r.sum : r.count) / max) * 100}%` }} />
                  </div>
                  <span className={classes.muted}>{f.money(measure === "sum" ? r.sum : r.count)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={classes.empty}>{t("crmsNothingYet")}</p>
          ))}
      </section>
      {!!saved?.length && (
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsSavedReports")}</h3>
          <ul className={crm.miniList}>
            {saved.map((r) => (
              <li key={r._id}>
                <button
                  type="button"
                  className={crm.miniMain}
                  onClick={() => {
                    const cfg = { entity: r.entity, groupBy: r.config.groupBy || groupBys[r.entity][0], measure: (r.config.measure as "count" | "sum") || "count", status: r.config.status || "" };
                    setEntity(cfg.entity);
                    setGroupBy(cfg.groupBy);
                    setMeasure(cfg.measure);
                    setStatus(cfg.status);
                    exec(cfg);
                  }}
                >
                  <span className={crm.fuText}>{r.name}</span>
                  <span className={classes.muted}>{t(`crmsEntity_${r.entity}`)}</span>
                </button>
                {canWrite && (
                  <button
                    type="button"
                    className={crm.linkDanger}
                    onClick={async () => {
                      if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/sales/reports/${r._id}`))) mutate();
                    }}
                  >
                    {t("crmsDelete")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// Sales reports (Nexxa crm/reports and reports/builder)
const SalesReports = () => {
  const t = useCrmText();
  const { data: meta } = useSalesMeta();
  return (
    <ClientTabSystem
      items={[
        { id: "funnel", title: t("crmsTabFunnelReport"), content: <Standard meta={meta} /> },
        { id: "builder", title: t("crmsTabBuilder"), content: <Builder meta={meta} /> },
      ]}
    />
  );
};

export default SalesReports;
