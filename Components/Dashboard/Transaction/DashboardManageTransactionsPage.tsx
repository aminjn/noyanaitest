"use client";

import WalletWithdrawal from "@/Components/_Common/Finance/WalletWithdrawal";
import useSWR from "swr";
import { ReactNode, useMemo, useState } from "react";
import classes from "./DashboardManageTransactionsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { currencize } from "@/Components/helpers/currencize";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import { ITransaction } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import { IWallet } from "@/Components/Booking/Finalize/FinalizeBookingPage";
import usePopup from "@/Components/Hooks/usePopup";
import WalletChargePopup from "@/Components/Payment/WalletChargePopup";
import { usePaymentConfig } from "@/Components/Payment/paymentTypes";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import DocumentIcon from "@/Components/Icons/DocumentIcon";
import ArrowCircleDownIcon from "@/Components/Icons/ArrowCircleDownIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";

const NS: ContentNamespace[] = ["common", "dashboardTransaction", "onlinePayment", "walletWithdrawal"];

type Row = ITransaction<{ Reservation: { Doctor: Record<never, never> } }>;

const TABS = ["all", "payments", "credits"] as const;
type Tab = (typeof TABS)[number];
const tabKeys: Record<Tab, ContentKey> = { all: "all", payments: "trTabPayments", credits: "trTabCredits" };

type Kind = "visit" | "order" | "topUp" | "other";
const kindOf = (t: Row): Kind =>
  t.reservation ? "visit" : t.order ? "order" : t.gatewayPayment ? "topUp" : "other";

const icons: Record<Kind, ReactNode> = {
  visit: <DocumentIcon />,
  order: <PackageIcon />,
  topUp: <ArrowCircleDownIcon />,
  other: <WalletIcon />,
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Wallet + transaction feed (bank-app style): balance card with SEP
// top-up, this month's in/out, and the history grouped by day.
const DashboardManageTransactionsPage = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const { setPopup } = usePopup();
  const [tab, setTab] = useState<Tab>("all");

  // wallet top-up via the SEP gateway (2026-09) - only offered while online
  // payment is enabled in the admin AppConfig
  const { data: paymentConfig } = usePaymentConfig();

  const { data: wallet } = useSWR<IWallet>(`${API}/user/wallet`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const { data, error } = useSWR<Row[]>(`${API}/user/transaction`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const fmt = useMemo(
    () => ({
      num: new Intl.NumberFormat(intlTag),
      day: new Intl.DateTimeFormat(intlTag, { weekday: "long", day: "numeric", month: "long" }),
      time: new Intl.DateTimeFormat(intlTag, { hour: "2-digit", minute: "2-digit" }),
      rel: new Intl.RelativeTimeFormat(intlTag, { numeric: "auto" }),
    }),
    [intlTag],
  );

  const rows = useMemo(() => (Array.isArray(data) ? data : []).filter((t) => typeof t?.amount === "number"), [data]);

  const month = useMemo(() => {
    const now = new Date();
    return rows.reduce(
      (acc, t) => {
        const d = new Date(t.createdAt);
        if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return acc;
        if (t.amount >= 0) acc.in += t.amount;
        else acc.out += -t.amount;
        return acc;
      },
      { in: 0, out: 0 },
    );
  }, [rows]);

  const counts: Record<Tab, number> = {
    all: rows.length,
    payments: rows.filter((t) => t.amount < 0).length,
    credits: rows.filter((t) => t.amount >= 0).length,
  };

  const groups = useMemo(() => {
    const shown = rows.filter((t) => (tab === "payments" ? t.amount < 0 : tab === "credits" ? t.amount >= 0 : true));
    const today = new Date();
    const yesterday = new Date(Date.now() - 864e5);
    const out: { key: string; label: string; items: Row[] }[] = [];
    for (const t of shown) {
      const d = new Date(t.createdAt);
      const key = dayKey(d);
      let g = out.find((x) => x.key === key);
      if (!g) {
        const label =
          key === dayKey(today)
            ? fmt.rel.format(0, "day")
            : key === dayKey(yesterday)
              ? fmt.rel.format(-1, "day")
              : fmt.day.format(d);
        g = { key, label, items: [] };
        out.push(g);
      }
      g.items.push(t);
    }
    return out;
  }, [rows, tab, fmt]);

  const describe = (t: Row) => {
    const kind = kindOf(t);
    if (kind === "visit") {
      const name = t.reservation?.doctor ? getDoctorProfileLabel(t.reservation.doctor) : "";
      return {
        title: getContent(t.amount >= 0 ? "trVisitRefund" : "trVisitPay", [name]),
        href: t.reservation?._id ? `/dashboard/booking/${t.reservation._id}` : undefined,
      };
    }
    if (kind === "order")
      return { title: getContent(t.amount >= 0 ? "trOrderRefund" : "trOrderPay"), href: `/order/${t.order}` };
    if (kind === "topUp") return { title: getContent("walletTopUp"), href: `/payment/${t.gatewayPayment}` };
    if ((t as { withdrawal?: string }).withdrawal) return { title: getContent("wdTitle") };
    return { title: getContent("trOther"), href: undefined };
  };

  return (
    <div className={classes.main}>
      <h1 className={classes.title}>{getContent("transactions")}</h1>

      <div className={classes.hero}>
        <section className={classes.wallet}>
          <div className={classes.walletHead}>
            <Ixon width="1.25rem">
              <WalletIcon />
            </Ixon>
            <span>{getContent("trWallet")}</span>
          </div>
          <span className={classes.balanceLabel}>{getContent("currentBalance")}</span>
          <strong className={classes.balance}>
            {wallet ? currencize(wallet.balance) : "—"} <small>{getContent("toman")}</small>
          </strong>
          {!!paymentConfig?.sepEnabled && (
            <div className={classes.chargeRow}>
              <button
                type="button"
                className={classes.charge}
                onClick={() => setPopup("WalletCharge", <WalletChargePopup />)}
              >
                <Ixon width="1rem">
                  <PlusIcon />
                </Ixon>
                {getContent("chargeWallet")}
              </button>
              <span className={classes.sep}>{getContent("trSepNote")}</span>
            </div>
          )}
        </section>

        <div className={classes.stats}>
          <div className={classes.stat}>
            <span>{getContent("trInMonth")}</span>
            <strong className={classes.plus}>
              <bdi dir="ltr">+{currencize(month.in)}</bdi> <small>{getContent("toman")}</small>
            </strong>
          </div>
          <div className={classes.stat}>
            <span>{getContent("trOutMonth")}</span>
            <strong className={classes.minus}>
              <bdi dir="ltr">−{currencize(month.out)}</bdi> <small>{getContent("toman")}</small>
            </strong>
          </div>
        </div>
      </div>

      {/* move wallet money to a bank account (refunds, payouts) */}
      <WalletWithdrawal />

      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className={`${classes.tab} ${tab === t ? classes.tabOn : ""}`}
                  onClick={() => setTab(t)}
                >
                  {getContent(tabKeys[t])}
                  <span className={classes.tabCount}>{fmt.num.format(counts[t])}</span>
                </button>
              ))}
            </div>

            {!groups.length ? (
              <div className={classes.empty}>{getContent("trEmpty")}</div>
            ) : (
              <div className={classes.feed}>
                {groups.map((g) => (
                  <section key={g.key} className={classes.group}>
                    <h2 className={classes.groupTitle}>{g.label}</h2>
                    <ul className={classes.list}>
                      {g.items.map((t) => {
                        const kind = kindOf(t);
                        const { title, href } = describe(t);
                        const body = (
                          <>
                            <span className={`${classes.icon} ${classes[kind]}`}>
                              <Ixon width="1.125rem">{icons[kind]}</Ixon>
                            </span>
                            <span className={classes.what}>
                              <strong>{title}</strong>
                              <span>{safeFormatDate(fmt.time, t.createdAt)}</span>
                            </span>
                            <span className={`${classes.amount} ${t.amount >= 0 ? classes.plus : classes.minus}`}>
                              <bdi dir="ltr">
                                {t.amount >= 0 ? "+" : "−"}
                                {currencize(Math.abs(t.amount))}
                              </bdi>{" "}
                              <small>{getContent("toman")}</small>
                            </span>
                          </>
                        );
                        return (
                          <li key={t._id}>
                            {href ? (
                              <Link href={href} className={classes.row}>
                                {body}
                              </Link>
                            ) : (
                              <div className={classes.row}>{body}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </HandleLoading>
    </div>
  );
};

export default DashboardManageTransactionsPage;
