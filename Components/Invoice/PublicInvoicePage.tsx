"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import classes from "./PublicInvoicePage.module.css";

type Invoice = {
  seller: string;
  number: number;
  date: string;
  dueDate?: string;
  party: { name?: string };
  doctorName?: string;
  lines: { title: string; qty: number; unitPrice: number; discount: number; tax: number; net: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  insurer?: { name: string; share: number };
  patientShare: number;
  paid: number;
  status: string;
};

const NS = ["common", "bizFinance" as ContentNamespace] as ContentNamespace[];

// What the patient sees at /i/<token> (2026-10): the provider's invoice,
// nothing else, ready to print or save as PDF.
const PublicInvoicePage = ({ token }: { token: string }) => {
  const t = useScopedLocale(NS);
  const tt = (k: string, v?: string[]) => t(k as ContentKey, v);
  const tag = useIntlLocale();
  const fmt = useMemo(
    () => ({
      money: (n?: number) => new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0)),
      int: (n?: number) => new Intl.NumberFormat(tag, { useGrouping: false }).format(Number(n) || 0),
      date: (v?: string) => {
        const d = v ? new Date(v) : null;
        return d && !Number.isNaN(d.getTime()) ? new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, dateStyle: "medium" }).format(d) : "—";
      },
    }),
    [tag],
  );
  const valid = /^[A-Za-z0-9_-]{8,20}$/.test(token);
  const { data, error } = useSWR<Invoice | null>(valid ? `${API}/public/invoice/${token}` : null, (url: string) =>
    fetcher({ url }).then((res) => (res.data as Invoice) || null),
  );
  const lines = Array.isArray(data?.lines) ? data!.lines : [];
  const due = data ? Math.max(0, data.patientShare - data.paid) : 0;
  return (
    <main className={classes.main}>
      <section className={classes.card}>
        {!valid || error ? (
          <p className={classes.text}>{tt("finPublicInvalid")}</p>
        ) : !data ? (
          <p className={classes.text}>…</p>
        ) : (
          <>
            <div className={classes.head}>
              <div className={classes.meta}>
                <h1 className={classes.title}>{data.seller}</h1>
                <span>{tt("finInvoiceN", [fmt.int(data.number)])}</span>
                <span>
                  {tt("bizDate")}: {fmt.date(data.date)}
                  {data.dueDate ? ` · ${tt("finDueDate")}: ${fmt.date(data.dueDate)}` : ""}
                </span>
                <span>
                  {tt("finPatientName")}: {data.party?.name || "—"}
                </span>
                {!!data.doctorName && (
                  <span>
                    {tt("finDoctorName")}: {data.doctorName}
                  </span>
                )}
              </div>
              <span className={`${classes.pill} ${data.status === "paid" ? classes.paid : ""}`}>
                {tt(
                  ({ issued: "finStIssued", partial: "finStPartial", paid: "finStPaid", void: "finStVoid" } as Record<string, string>)[data.status] ||
                    "finStIssued",
                )}
              </span>
            </div>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{tt("finService")}</th>
                    <th className={classes.num}>{tt("finQty")}</th>
                    <th className={classes.num}>{tt("finUnitPrice")}</th>
                    <th className={classes.num}>{tt("finDiscount")}</th>
                    <th className={classes.num}>{tt("finTax")}</th>
                    <th className={classes.num}>{tt("bizTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td>{l.title}</td>
                      <td className={classes.num}>{fmt.money(l.qty)}</td>
                      <td className={classes.num}>{fmt.money(l.unitPrice)}</td>
                      <td className={classes.num}>{fmt.money(l.discount)}</td>
                      <td className={classes.num}>{fmt.money(l.tax)}</td>
                      <td className={classes.num}>{fmt.money(l.net + l.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={classes.totals}>
              <div>
                <span>{tt("finSubtotal")}</span>
                <span>{fmt.money(data.subtotal)}</span>
              </div>
              <div>
                <span>{tt("finDiscount")}</span>
                <span>{fmt.money(data.discount)}</span>
              </div>
              <div>
                <span>{tt("finTax")}</span>
                <span>{fmt.money(data.tax)}</span>
              </div>
              <div className={classes.grand}>
                <span>{tt("bizTotal")}</span>
                <span>
                  {fmt.money(data.total)} {tt("toman")}
                </span>
              </div>
              {!!data.insurer && (
                <div>
                  <span>
                    {tt("finInsurerShare")} ({data.insurer.name})
                  </span>
                  <span>{fmt.money(data.insurer.share)}</span>
                </div>
              )}
              <div>
                <span>{tt("invPaid")}</span>
                <span>{fmt.money(data.paid)}</span>
              </div>
              <div className={classes.grand}>
                <span>{tt("invDue")}</span>
                <span>
                  {fmt.money(due)} {tt("toman")}
                </span>
              </div>
            </div>
            <div className={classes.actions}>
              <button type="button" onClick={() => window.print()}>
                {tt("finPrint")}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default PublicInvoicePage;
