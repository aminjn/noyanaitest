"use client";

import { useMemo, useState } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useSWR from "swr";
import classes from "./PanelFinancePage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Ixon from "@/Components/UI/Ixon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import MedalIcon from "@/Components/Icons/MedalIcon";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import WalletWithdrawal from "./WalletWithdrawal";


type FinanceTransaction = {
  _id: string;
  amount: number;
  // a payout shows what the service was worth and the platform fee taken
  grossAmount?: number;
  commission?: number;
  commissionPercent?: number;
  createdAt: string;
  reservation?: {
    date: string;
    start: number;
    sessionType: string;
    patient?: { givenName: string; lastName: string } | null;
  } | null;
  license?: { displayName?: string } | null;
  // a sold order line (pharmacy / doctor service / paraclinic payout)
  order?: { submittedAt?: string } | null;
};

type PanelFinance = {
  balance: number;
  // the owner can move the money to the bank (not a secretary)
  canWithdraw?: boolean;
  income: { thisMonth: number; lastMonth: number; allTime: number };
  upcoming: { total: number; count: number };
  licenseSpend: number;
  months: { month: string; total: number }[];
  transactions: { items: FinanceTransaction[]; total: number; page: number; limit: number };
};

const makeFormats = (tag: string) => ({
  num: new Intl.NumberFormat(tag),
  monthLabel: new Intl.DateTimeFormat(tag, { month: "long" }),
  dateTime: new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  shortDate: new Intl.DateTimeFormat(tag, { month: "long", day: "numeric" }),
});

const Tile = ({
  icon,
  label,
  value,
  unit,
  note,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  note?: string;
  highlight?: boolean;
}) => (
  <div className={`${classes.tile} ${highlight ? classes.highlight : ""}`}>
    <span className={classes.tileHead}>
      <Ixon width="1.25rem" className={classes.tileIcon}>
        {icon}
      </Ixon>
      <span>{label}</span>
    </span>
    <span className={classes.tileValue}>
      {value}
      <span className={classes.tileUnit}>{unit}</span>
    </span>
    {note && <span className={classes.tileNote}>{note}</span>}
  </div>
);

// One money page for every provider panel (2026-09): the doctor's and the
// pharmacy's /finance endpoints return the same shape; only the texts that
// name the income source differ.
export type PanelFinanceConfig = {
  namespaces: ContentNamespace[];
  // "/doctorpanel", "/pharmacypanel"
  panel: string;
  // "/doctor/finance", "/pharmacy/finance"
  api: string;
  noteKey: ContentKey;
  upcomingKey: ContentKey;
  upcomingNoteKey: ContentKey;
};

const PanelFinancePage = ({
  namespaces,
  panel,
  api,
  noteKey,
  upcomingKey,
  upcomingNoteKey,
}: PanelFinanceConfig) => {
  const getContent = useScopedLocale(namespaces);
  const intlTag = useIntlLocale();
  const { num, monthLabel, dateTime, shortDate } = useMemo(() => makeFormats(intlTag), [intlTag]);
  const [page, setPage] = useState(1);
  const [hover, setHover] = useState<number | null>(null);

  useBreadCrump([
    { title: getContent("dashboard"), target: panel },
    { title: getContent("financialMangement"), target: `${panel}/finance` },
  ]);

  const { data, error, isValidating } = useSWR<PanelFinance>(
    `${API}${api}?page=${page}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const toman = getContent("toman");
  const maxMonth = data ? Math.max(1, ...data.months.map((m) => m.total)) : 1;
  const pages = data
    ? Math.max(1, Math.ceil(data.transactions.total / data.transactions.limit))
    : 1;

  const describe = (t: FinanceTransaction) => {
    if (t.reservation) {
      const who = t.reservation.patient
        ? `${t.reservation.patient.givenName} ${t.reservation.patient.lastName}`
        : "";
      const when = safeFormatDate(shortDate, t.reservation.date);
      return {
        title: getContent("dpfReservationPayout", [when]),
        sub: [who, getContent(t.reservation.sessionType as ContentKey)]
          .filter(Boolean)
          .join(" · "),
      };
    }
    if (t.order)
      return {
        title: getContent("pfOrderPayout", [safeFormatDate(shortDate, t.order.submittedAt || t.createdAt)]),
        sub: "",
      };
    if (t.license)
      return { title: getContent("dpfLicensePurchase", [t.license.displayName || ""]), sub: "" };
    return { title: getContent("dpfOther"), sub: "" };
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("financialMangement")}</h1>
            <span className={classes.subtitle}>{getContent(noteKey)}</span>
          </header>

          <div className={classes.tiles}>
            <Tile
              icon={<WalletIcon />}
              label={getContent("dpfBalance")}
              value={num.format(data.balance)}
              unit={toman}
              highlight
            />
            <Tile
              icon={<CalendarIcon />}
              label={getContent("dpfThisMonth")}
              value={num.format(data.income.thisMonth)}
              unit={toman}
              note={getContent("dpfLastMonth", [`${num.format(data.income.lastMonth)} ${toman}`])}
            />
            <Tile
              icon={<ClockIcon />}
              label={getContent(upcomingKey)}
              value={num.format(data.upcoming.total)}
              unit={toman}
              note={getContent(upcomingNoteKey, [num.format(data.upcoming.count)])}
            />
            <Tile
              icon={<MedalIcon />}
              label={getContent("dpfAllTime")}
              value={num.format(data.income.allTime)}
              unit={toman}
              note={getContent("dpfLicenseSpend", [`${num.format(data.licenseSpend)} ${toman}`])}
            />
          </div>

          {data.canWithdraw && <WalletWithdrawal />}

          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{getContent("dpfMonthlyIncome")}</h2>
            <div className={classes.chart} role="img" aria-label={getContent("dpfMonthlyIncome")}>
              {data.months.map((m, i) => (
                <div
                  key={m.month}
                  className={classes.barCol}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className={`${classes.barValue} ${hover === i || i === data.months.length - 1 ? classes.barValueShown : ""}`}>
                    {num.format(m.total)}
                  </span>
                  <div className={classes.barTrack}>
                    <div
                      className={`${classes.bar} ${hover === i ? classes.barHover : ""}`}
                      style={{ height: `${(m.total / maxMonth) * 100}%` }}
                    />
                  </div>
                  <span className={classes.barLabel}>{safeFormatDate(monthLabel, m.month)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{getContent("dpfTransactions")}</h2>
            {data.transactions.items.length === 0 ? (
              <p className={classes.empty}>{getContent("dpfNoTransactions")}</p>
            ) : (
              <div className={`${classes.tableWrap} ${isValidating ? classes.stale : ""}`}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{getContent("dpfDate")}</th>
                      <th>{getContent("dpfDescription")}</th>
                      <th className={classes.amountCol}>{getContent("dpfAmount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.items.map((t) => {
                      const d = describe(t);
                      return (
                        <tr key={t._id}>
                          <td className={classes.muted}>{safeFormatDate(dateTime, t.createdAt)}</td>
                          <td>
                            <span className={classes.desc}>{d.title}</span>
                            {d.sub && <span className={classes.descSub}>{d.sub}</span>}
                            {!!t.commission && (
                              <span className={classes.descSub}>
                                {getContent("dpfCommission", [
                                  num.format(t.grossAmount || 0),
                                  String(t.commissionPercent ?? 0),
                                  num.format(t.commission),
                                ])}
                              </span>
                            )}
                          </td>
                          <td className={`${classes.amountCol} ${t.amount >= 0 ? classes.credit : classes.debit}`}>
                            {`${t.amount >= 0 ? "+" : "−"}${num.format(Math.abs(t.amount))}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {data.transactions.total > data.transactions.limit && (
              <div className={classes.pagination}>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {getContent("dpfPrev")}
                </button>
                <span>{getContent("dpfPage", [num.format(page), num.format(pages)])}</span>
                <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  {getContent("dpfNext")}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

export default PanelFinancePage;
