"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Link from "@/Components/i18n/Link";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../../Accounting.module.css";
import { asArray, useBizFormat } from "../../bizShared";
import { downloadCsv, useFin, useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { AiInsight, sevClass, sevKey } from "./finAi";

type Check = { kind: string; severity: string; key: string; vars: string[]; amount: number; link: string };
type Line = { id: string; number: number; date: string; account: string; label: string; amount: number; severity: string; reason: string; vars: string[] };
type Result = { counts: { high: number; medium: number; low: number }; checks: Check[]; lines: Line[] };

// Nexxa's anomalies page: fixed rules, not machine learning - an amount far
// from its account type's usual (median and MAD), a probable duplicate, a
// large entry on a Friday, a large expense without a cost centre - plus the
// practice's own checks: insurer claims unpaid after 60 days, shares never
// sent to the insurer, the same payment twice, an expense far above its
// kind, revenue falling, overdue and bounced cheques.
const Anomalies = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, panel } = useFin();
  const { data, error } = useSWR<Result>(`${API}${api}/ai/anomalies`, (url: string) => fetcher({ url }).then((res) => res.data as Result), { revalidateOnFocus: false });
  const checks = asArray<Check>(data?.checks);
  const lines = asArray<Line>(data?.lines);
  const base = `${panel}/finance`;
  const fmtVars = (vars: string[]) => asArray<string>(vars).map((v) => (/^\d+$/.test(String(v)) ? f.money(Number(v)) : String(v)));
  const exportCsv = () =>
    downloadCsv("anomalies", [
      [t("faiSeverity"), t("bizNumber"), t("bizDate"), t("bizAccount"), t("bizAmount"), t("faiReason")],
      ...lines.map((l) => [t(sevKey(l.severity)), l.number, f.date(l.date), l.account, l.amount, t(l.reason, fmtVars(l.vars))]),
    ]);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <AiInsight kind="anomalies" label={t("faiInsightAnomalies")} />
          <div className={classes.tiles}>
            {(["high", "medium", "low"] as const).map((s) => (
              <div key={s} className={classes.tile}>
                <span className={classes.tileLabel}>{t(sevKey(s))}</span>
                <span className={`${classes.tileValue} ${s === "high" ? classes.negative : ""}`}>{f.money(data.counts?.[s])}</span>
              </div>
            ))}
          </div>
          <section className={classes.card}>
            <span className={classes.cardTitle}>{t("faiChecksTitle")}</span>
            {checks.length === 0 ? (
              <p className={classes.empty}>{t("faiNoChecks")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("faiSeverity")}</th>
                      <th>{t("faiReason")}</th>
                      <th className={classes.num}>{t("bizAmount")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {checks.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`${ai.sev} ${sevClass(c.severity)}`}>{t(sevKey(c.severity))}</span>
                        </td>
                        <td className={classes.wrap}>{t(c.key, fmtVars(c.vars))}</td>
                        <td className={classes.num}>{c.amount ? f.money(c.amount) : "—"}</td>
                        <td>
                          <Link className={classes.rowLink} href={`${base}/${c.link}`}>
                            {t("faiOpen")}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("faiLinesTitle")}</span>
              <button type="button" className={classes.ghost} onClick={exportCsv} disabled={!lines.length}>
                {t("finExportCsv")}
              </button>
            </div>
            {lines.length === 0 ? (
              <p className={classes.empty}>{t("faiNoAnomalies")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("faiSeverity")}</th>
                      <th>{t("bizNumber")}</th>
                      <th>{t("bizDate")}</th>
                      <th>{t("bizAccount")}</th>
                      <th className={classes.num}>{t("bizAmount")}</th>
                      <th>{t("faiReason")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={l.id}>
                        <td>
                          <span className={`${ai.sev} ${sevClass(l.severity)}`}>{t(sevKey(l.severity))}</span>
                        </td>
                        <td>
                          <Link className={classes.rowLink} href={`${base}/accounting`}>
                            #{f.year(l.number)}
                          </Link>
                        </td>
                        <td>{f.date(l.date)}</td>
                        <td className={classes.wrap}>
                          {l.account}
                          {!!l.label && <span className={classes.muted}> · {l.label}</span>}
                        </td>
                        <td className={classes.num}>{f.money(l.amount)}</td>
                        <td className={classes.wrap}>{t(l.reason, fmtVars(l.vars))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <p className={classes.muted}>{t("faiAnomalyBasis")}</p>
        </>
      )}
    </HandleLoading>
  );
};

export default Anomalies;
