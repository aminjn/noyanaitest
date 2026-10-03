"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { useIntlLocale } from "@/Components/i18n/navigation";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { PayYear, usePay, usePayText } from "./payShared";

// The year's legal figures, as Noyan applies them (set by the super admin
// from the Supreme Labour Council and budget law): read-only here, so a
// provider sees exactly what a payslip is computed from.
const PayrollRules = ({ years, initial }: { years: number[]; initial: number }) => {
  const t = usePayText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const { api } = usePay();
  const [year, setYear] = useState(initial);
  const { data, error } = useSWR<PayYear>(year ? `${API}${api}/years/${year}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data as PayYear),
  );
  const yearText = (y: number) => new Intl.NumberFormat(tag, { useGrouping: false }).format(y);
  const pct = (n: number) => new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 2 }).format(n / 100);
  const row = (label: string, value: string) => (
    <tr>
      <td className={classes.wrap}>{label}</td>
      <td className={classes.num}>{value}</td>
    </tr>
  );
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("payRulesTitle")}</span>
        {years.length > 1 && (
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label={t("payYear")}>
            {years.map((y) => (
              <option key={y} value={y}>
                {yearText(y)}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className={classes.muted}>{t("payRulesHint")}</p>
      {!years.length ? (
        <p className={classes.empty}>{t("payNoRules")}</p>
      ) : (
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <div className={classes.statementGrid}>
              <table className={classes.table}>
                <tbody>
                  {row(t("payMinWage"), f.money(data.minWage))}
                  {row(t("payHousing"), f.money(data.housing))}
                  {row(t("payFood"), f.money(data.food))}
                  {row(t("payChildPer"), f.money(data.childAllowance))}
                  {row(t("payOvertimeRule"), `${f.money(data.monthHours)} · ×${new Intl.NumberFormat(tag).format(data.overtimeMultiplier)}`)}
                  {row(t("payInsuranceRates"), `${pct(data.employeeInsuranceRate)} / ${pct(data.employerInsuranceRate)}`)}
                  {row(t("payInsuranceCeiling"), f.money(data.minWage * data.insuranceCeilingMultiplier))}
                </tbody>
              </table>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("payTaxBrackets")}</th>
                    <th className={classes.num} />
                  </tr>
                </thead>
                <tbody>
                  {row(t("payTaxExempt", [f.money(data.taxExemption)]), pct(0))}
                  {asArray<PayYear["brackets"][number]>(data.brackets).map((b, i, all) => {
                    const from = i === 0 ? data.taxExemption : all[i - 1].upTo || 0;
                    return (
                      <tr key={i}>
                        <td className={classes.wrap}>
                          {b.upTo == null ? t("payTaxAbove", [f.money(from)]) : t("payTaxRange", [f.money(from), f.money(b.upTo)])}
                        </td>
                        <td className={classes.num}>{pct(b.rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </HandleLoading>
      )}
    </section>
  );
};

export default PayrollRules;
