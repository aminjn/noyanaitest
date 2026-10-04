"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Link from "@/Components/i18n/Link";
import { useIntlLocale } from "@/Components/i18n/navigation";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, useBizFormat } from "../bizShared";
import FinanceShell from "./FinanceShell";
import PaymentForm, { POPUP_KEY } from "./PaymentForm";
import { FinMoney, moneyKindKey, Pill, useFin, useFinPopup, useFinText } from "./finShared";

type Overview = {
  month: { income: number; expense: number; profit: number };
  year: { year: number; income: number; expense: number; profit: number };
  money: FinMoney[];
  cash: number;
  bank: number;
  receivables: { patients: number; insurers: number; cheques: number };
  payables: { vendors: number; cheques: number; salaries: number; vat: number };
  cheques: {
    upcoming: { _id: string; direction: "in" | "out"; amount: number; party?: string; cheque: { number: string; bank: string; dueDate: string; status: string } }[];
    overdue: number;
    bounced: number;
  };
  wallet: { balance: number; pending: number; nextReleaseAt: string | null; holdDays: number | null };
  open: Record<"invoices" | "expenses" | "claims", { count: number; amount: number }>;
  series: { month: string; label: string; income: number; expense: number }[];
};

const Body = ({ hasInsurance }: { hasInsurance: boolean }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, panel, canWrite } = useFin();
  const { open } = useFinPopup();
  const { data, error, mutate } = useSWR<Overview>(`${API}${api}/overview`, (url: string) => fetcher({ url }).then((res) => res.data as Overview));
  const series = asArray<Overview["series"][number]>(data?.series);
  const max = useMemo(() => Math.max(1, ...series.flatMap((m) => [m.income, m.expense])), [series]);
  const toman = t("toman");
  const base = `${panel}/finance`;
  // the buckets are Jalali months as Tehran sees them: named that way in
  // every language (a Gregorian name would straddle two buckets)
  const tag = useIntlLocale();
  const jMonth = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(tag, { month: "short", calendar: "persian", timeZone: "Asia/Tehran" });
    return (v: string) => {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? "—" : fmt.format(d);
    };
  }, [tag]);

  const tile = (label: string, value: number, opts?: { primary?: boolean; sign?: boolean; href?: string }) => {
    const inner = (
      <>
        <span className={classes.tileLabel}>{label}</span>
        <span className={`${classes.tileValue} ${opts?.sign ? (value < 0 ? classes.negative : classes.positive) : ""}`}>
          {f.signed(value)}
          <span className={classes.tileUnit}>{toman}</span>
        </span>
      </>
    );
    return opts?.href ? (
      <Link href={opts.href} className={`${classes.tile} ${opts?.primary ? classes.primaryTile : ""}`}>
        {inner}
      </Link>
    ) : (
      <div className={`${classes.tile} ${opts?.primary ? classes.primaryTile : ""}`}>{inner}</div>
    );
  };
  const freeEntry = (direction: "in" | "out") =>
    open(POPUP_KEY, <PaymentForm direction={direction} against="account" onDone={() => mutate()} />);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          {canWrite && (
            <nav className={fin.quick} aria-label={t("finQuickActions")}>
              <Link href={`${base}/invoices?new=1`}>{t("finNewInvoice")}</Link>
              <button type="button" onClick={() => freeEntry("in")}>
                {t("finNewReceipt")}
              </button>
              <button type="button" onClick={() => freeEntry("out")}>
                {t("finNewPayment")}
              </button>
              <Link href={`${base}/expenses?new=1`}>{t("finNewExpense")}</Link>
              {hasInsurance && <Link href={`${base}/insurance?new=1`}>{t("finNewClaim")}</Link>}
            </nav>
          )}

          <div className={classes.tiles}>
            {tile(t("finMonthProfit"), data.month.profit, { primary: true })}
            {tile(t("bizMonthIncome"), data.month.income)}
            {tile(t("bizMonthExpense"), data.month.expense)}
            {tile(t("finYearProfit", [f.year(data.year.year)]), data.year.profit, { sign: true })}
            {tile(t("finCashOnHand"), data.cash, { href: `${base}/payments?tab=accounts` })}
            {tile(t("finBankBalance"), data.bank, { href: `${base}/payments?tab=accounts` })}
          </div>

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("finChart12")}</span>
              <span className={classes.legend}>
                <span>
                  <i className={classes.dot} style={{ background: "var(--primary6)" }} />
                  {t("bizIncome")}
                </span>
                <span>
                  <i className={classes.dot} style={{ background: "var(--warningS2, var(--warning))" }} />
                  {t("bizExpense")}
                </span>
              </span>
            </div>
            <div className={`${classes.chart} ${fin.chart12}`} role="img" aria-label={t("finChart12")}>
              {series.map((m) => (
                <div key={m.label} className={classes.barCol}>
                  <div className={classes.bars}>
                    <div
                      className={classes.barIncome}
                      title={`${jMonth(m.month)} · ${t("bizIncome")}: ${f.money(m.income)}`}
                      style={{ height: `${(Math.max(0, m.income) / max) * 100}%` }}
                    />
                    <div
                      className={classes.barExpense}
                      title={`${jMonth(m.month)} · ${t("bizExpense")}: ${f.money(m.expense)}`}
                      style={{ height: `${(Math.max(0, m.expense) / max) * 100}%` }}
                    />
                  </div>
                  <span className={classes.barLabel}>{jMonth(m.month)}</span>
                </div>
              ))}
            </div>
            <div className={fin.summaryBar}>
              <span>
                {t("finYtdIncome")}: <b>{f.money(data.year.income)}</b>
              </span>
              <span>
                {t("finYtdExpense")}: <b>{f.money(data.year.expense)}</b>
              </span>
            </div>
          </section>

          <div className={fin.grid3}>
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("finReceivables")}</span>
                <Link className={fin.link} href={`${base}/reports?tab=aging`}>
                  {t("finAging")}
                </Link>
              </div>
              <dl className={fin.kv}>
                <div>
                  <dt>{t("finFromPatients")}</dt>
                  <dd>{f.signed(data.receivables.patients)}</dd>
                </div>
                {hasInsurance && (
                  <div>
                    <dt>{t("finFromInsurers")}</dt>
                    <dd>{f.signed(data.receivables.insurers)}</dd>
                  </div>
                )}
                <div>
                  <dt>{t("finChequesIn")}</dt>
                  <dd>{f.signed(data.receivables.cheques)}</dd>
                </div>
                <div className={fin.kvTotal}>
                  <dt>{t("bizTotal")}</dt>
                  <dd>{f.signed(data.receivables.patients + data.receivables.insurers + data.receivables.cheques)}</dd>
                </div>
              </dl>
            </section>
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("finPayables")}</span>
              </div>
              <dl className={fin.kv}>
                <div>
                  <dt>{t("finToVendors")}</dt>
                  <dd>{f.signed(data.payables.vendors)}</dd>
                </div>
                <div>
                  <dt>{t("finChequesOut")}</dt>
                  <dd>{f.signed(data.payables.cheques)}</dd>
                </div>
                <div>
                  <dt>{t("finSalariesDue")}</dt>
                  <dd>{f.signed(data.payables.salaries)}</dd>
                </div>
                <div>
                  <dt>{t("finVatDue")}</dt>
                  <dd>{f.signed(data.payables.vat)}</dd>
                </div>
              </dl>
            </section>
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("finWallet")}</span>
                <Link className={fin.link} href={`${base}/wallet`}>
                  {t("finWalletOpen")}
                </Link>
              </div>
              <dl className={fin.kv}>
                <div>
                  <dt>{t("bizNoyanWallet")}</dt>
                  <dd>{f.money(data.wallet.balance)}</dd>
                </div>
                <div>
                  <dt>{t("bizNoyanPending")}</dt>
                  <dd>{f.money(data.wallet.pending)}</dd>
                </div>
                <div>
                  <dt>{t("finNextSettlement")}</dt>
                  <dd>{data.wallet.nextReleaseAt ? f.date(data.wallet.nextReleaseAt) : "—"}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className={fin.grid2}>
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("finUpcomingCheques")}</span>
                <Link className={fin.link} href={`${base}/payments?tab=cheques`}>
                  {t("finChequeRegister")}
                </Link>
              </div>
              {(data.cheques.overdue > 0 || data.cheques.bounced > 0) && (
                <p className={fin.notice}>{t("finChequeAlert", [f.money(data.cheques.overdue), f.money(data.cheques.bounced)])}</p>
              )}
              {data.cheques.upcoming.length === 0 ? (
                <p className={classes.empty}>{t("finNoUpcomingCheques")}</p>
              ) : (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("finChqDue")}</th>
                        <th>{t("finChqNumber")}</th>
                        <th>{t("finParty")}</th>
                        <th className={classes.num}>{t("bizAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.cheques.upcoming.map((c) => (
                        <tr key={c._id}>
                          <td>
                            {f.date(c.cheque?.dueDate)}{" "}
                            <Pill status={new Date(c.cheque?.dueDate).getTime() < Date.now() ? "overdue" : c.direction === "in" ? "issued" : "partial"}>
                              {t(c.direction === "in" ? "finChqReceived" : "finChqIssued")}
                            </Pill>
                          </td>
                          <td dir="ltr">{c.cheque?.number}</td>
                          <td className={classes.wrap}>{c.party || "—"}</td>
                          <td className={classes.num}>{f.money(c.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("finToFollow")}</span>
              </div>
              <dl className={fin.kv}>
                <div>
                  <dt>
                    <Link className={fin.link} href={`${base}/invoices?status=open`}>
                      {t("finOpenInvoices", [f.money(data.open.invoices.count)])}
                    </Link>
                  </dt>
                  <dd>{f.money(data.open.invoices.amount)}</dd>
                </div>
                <div>
                  <dt>
                    <Link className={fin.link} href={`${base}/expenses?status=unpaid`}>
                      {t("finUnpaidExpenses", [f.money(data.open.expenses.count)])}
                    </Link>
                  </dt>
                  <dd>{f.money(data.open.expenses.amount)}</dd>
                </div>
                {hasInsurance && (
                  <div>
                    <dt>
                      <Link className={fin.link} href={`${base}/insurance`}>
                        {t("finOpenClaims", [f.money(data.open.claims.count)])}
                      </Link>
                    </dt>
                    <dd>{f.money(data.open.claims.amount)}</dd>
                  </div>
                )}
              </dl>
              <span className={classes.cardTitle}>{t("finTills")}</span>
              <dl className={fin.kv}>
                {data.money.map((m) => (
                  <div key={m._id}>
                    <dt>
                      {m.name} <span className={fin.small}>({t(moneyKindKey(m.kind))})</span>
                    </dt>
                    <dd className={m.balance < 0 ? classes.negative : ""}>{f.signed(m.balance)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          <p className={classes.muted}>{t("finOverviewNote")}</p>
        </>
      )}
    </HandleLoading>
  );
};

// «مالی و حسابداری» → نمای کلی (2026-10): the practice's money on one
// screen, after Practo Ray's and Doctolib Pro's finance home, in the Jalali
// calendar and toman, with the Iranian practice's own items: cheques
// falling due, the insurers' share, the Noyan wallet and its settlement.
const FinanceOverview = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finOverviewTitle" subtitle="finOverviewSubtitle" segment="">
    <Body hasInsurance={node !== "insurance"} />
  </FinanceShell>
);

export default FinanceOverview;
