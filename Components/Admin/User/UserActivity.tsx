"use client";

import { Suspense, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { currencize } from "@/Components/helpers/currencize";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import { ta } from "@/Components/Admin/i18n/adminText";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import HandleLoading from "../UI/HandleLoading";
import { FinancePager, useFinanceList } from "../Finance/FinanceListControls";
import { orderStatusDict, paymentMethodDict, transactionKindDict } from "../Finance/adminFinance";
import AdminManageReservationsPage from "../Reservation/AdminManageReservationsPage";
import { formatDateTime, newRequestKey, personLabel } from "../Reservation/reservationAdmin";
import classes from "./AdminManageUserPage.module.css";

// The user's activity on their admin page (2026-10, audit P1-3 / P2-6):
// their reservations, orders and wallet ledger, each a server-paged list
// linking to its record, and the wallet correction. Support answers "where
// is my money / my appointment" from one place, like the Doctolib / Practo
// back-office patient view.

type OrderRow = {
  _id: string;
  total?: number;
  status?: string;
  paymentMethod?: string;
  submittedAt?: string;
  lines?: number;
};

type LedgerRow = {
  _id: string;
  amount: number;
  createdAt?: string;
  kind: string;
  ref?: string | null;
  adminAction?: string;
  adminBy?: { _id: string; phone?: string; username?: string } | null;
  note?: string;
  // a provider earning still in its settlement hold
  held?: boolean;
  availableAt?: string;
};

type Ledger = { balance: number; pending: number; items: LedgerRow[]; total: number; page: number; limit: number };

const LEDGER_SIZE = 20;

const kindLabel = (kind: string) =>
  kind === "adminAdjustment" ? ta("اصلاح دستی کیف پول") : transactionKindDict[kind] || kind;

const signed = (amount?: number) =>
  typeof amount === "number"
    ? `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${currencize(Math.abs(amount))}`
    : "—";

// a ledger row's record in the admin panel, when it has one
const refHref = (row: LedgerRow) => {
  if (!row.ref) return null;
  if (row.kind === "reservation") return adminPath(`/reservation/${row.ref}`);
  if (row.kind === "order") return adminPath(`/finance/orders/${row.ref}`);
  return null;
};

export const AdjustWalletPopup = ({
  userId,
  balance,
  onDone,
}: {
  userId: string;
  balance: number;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [requestKey] = useState(newRequestKey);
  return (
    <PopupCard title={ta("اصلاح موجودی کیف پول")}>
      <p className={classes.note}>
        {ta("موجودی فعلی: ${1} تومان. هر اصلاح با دلیلش در تاریخچه‌ی کیف پول کاربر و لاگ عملیات ثبت می‌شود و به کاربر اطلاع داده می‌شود. برداشت بیشتر از موجودی ممکن نیست.", [currencize(balance)])}
      </p>
      <CreateForm<{ direction: string; amount: number; reason: string }>
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/admin/wallet/${userId}/adjust`,
          method: "POST",
          parser: "JSON",
          hasProblem: (inp) =>
            !inp.direction
              ? ta("نوع اصلاح را انتخاب کنید")
              : !(Number(inp.amount) > 0)
                ? ta("مبلغ باید بیشتر از صفر باشد")
                : inp.direction === "debit" && Number(inp.amount) > balance
                  ? ta("برداشت بیشتر از موجودی کیف پول ممکن نیست")
                  : !inp.reason || String(inp.reason).trim().length < 5
                    ? ta("دلیل اصلاح را بنویسید")
                    : undefined,
          mutator: (inp) => ({
            direction: inp.direction,
            amount: Number(inp.amount),
            reason: String(inp.reason || "").trim(),
            requestKey,
          }),
          successCb: () => {
            closePopup();
            onDone();
          },
        }}
        renderer={{
          direction: {
            type: "select",
            title: ta("نوع اصلاح"),
            required: true,
            options: { credit: ta("افزایش (واریز)"), debit: ta("کاهش (برداشت)") },
          },
          amount: { type: "number", price: true, title: ta("مبلغ (تومان)"), required: true },
          reason: { type: "area", title: ta("دلیل (الزامی)"), required: true },
        }}
      />
    </PopupCard>
  );
};

const UserOrders = ({ userId }: { userId: string }) => {
  const [page, setPage] = useState(1);
  const { data, error, isValidating } = useFinanceList<OrderRow>(
    `${API}/admin/finance/orders`,
    new URLSearchParams({ user: userId }),
    page,
    10,
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <Table
            name="AdminUserOrders"
            data={data.rows}
            renderer={{
              order: {
                name: ta("سفارش"),
                value: (node) => String(node._id).slice(-8),
                component: (node) => (
                  <InlineLink href={adminPath(`/finance/orders/${node._id}`)}>
                    {String(node._id).slice(-8)}
                  </InlineLink>
                ),
              },
              total: {
                name: ta("مبلغ (تومان)"),
                value: (node) => node.total ?? 0,
                component: (node) => currencize(node.total),
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => orderStatusDict[node.status || ""] || node.status || "—",
              },
              paymentMethod: {
                name: ta("روش پرداخت"),
                value: (node) =>
                  paymentMethodDict[node.paymentMethod || ""] || node.paymentMethod || "—",
              },
              lines: { name: ta("اقلام"), value: (node) => node.lines ?? "—" },
              submittedAt: {
                name: ta("تاریخ"),
                value: (node) => (node.submittedAt ? new Date(node.submittedAt) : undefined),
              },
            }}
          />
          <FinancePager
            total={data.total}
            page={page}
            limit={data.limit}
            setPage={setPage}
            stale={isValidating}
          />
        </>
      )}
    </HandleLoading>
  );
};

const UserWallet = ({ userId, onChanged }: { userId: string; onChanged: () => unknown }) => {
  const [page, setPage] = useState(1);
  const { setPopup } = usePopup();
  const { data, error, isValidating, mutate } = useSWR<Ledger>(
    `${API}/admin/wallet/${userId}?page=${page}&limit=${LEDGER_SIZE}`,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const body = res?.data?.data || {};
        return {
          balance: Number(body.balance) || 0,
          pending: Number(body.pending) || 0,
          items: Array.isArray(body.items) ? body.items : [],
          total: Number(body.total) || 0,
          page: Number(body.page) || page,
          limit: Number(body.limit) || LEDGER_SIZE,
        };
      }),
    { keepPreviousData: true },
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.activity}>
          <div className={classes.cardHead}>
            <strong>
              {ta("موجودی: ${1} تومان", [currencize(data.balance)])}
              {data.pending > 0 &&
                ` · ${ta("در دوره‌ی تسویه: ${1} تومان", [currencize(data.pending)])}`}
            </strong>
            <Button
              size="M"
              mode="Outline"
              onClick={() =>
                setPopup(
                  "AdminAdjustWallet",
                  <AdjustWalletPopup
                    userId={userId}
                    balance={data.balance}
                    onDone={() => {
                      mutate();
                      onChanged();
                    }}
                  />,
                )
              }
            >
              {ta("اصلاح موجودی کیف پول")}
            </Button>
          </div>
          <Table
            name="AdminUserWallet"
            data={data.items}
            renderer={{
              kind: {
                name: ta("بابت"),
                value: (node) => kindLabel(node.kind),
                component: (node) => {
                  const href = refHref(node);
                  return href ? (
                    <InlineLink href={href}>{kindLabel(node.kind)}</InlineLink>
                  ) : (
                    kindLabel(node.kind)
                  );
                },
              },
              amount: {
                name: ta("مبلغ (تومان)"),
                value: (node) => node.amount,
                component: (node) => signed(node.amount),
              },
              note: {
                name: ta("توضیح"),
                value: (node) =>
                  node.held && node.availableAt
                    ? ta("در دوره‌ی تسویه تا ${1}", [formatDateTime(node.availableAt) || "—"])
                    : node.note
                      ? `${node.note}${node.adminBy ? ` (${personLabel(node.adminBy)})` : ""}`
                      : "—",
              },
              createdAt: {
                name: ta("تاریخ"),
                value: (node) => formatDateTime(node.createdAt),
              },
            }}
          />
          <FinancePager
            total={data.total}
            page={page}
            limit={data.limit}
            setPage={setPage}
            stale={isValidating}
          />
        </div>
      )}
    </HandleLoading>
  );
};

const UserActivity = ({
  userId,
  canSeeReservations,
  canSeeMoney,
  onChanged,
}: {
  userId: string;
  canSeeReservations: boolean;
  // orders and the wallet are money: full admins only
  canSeeMoney: boolean;
  onChanged: () => unknown;
}) => {
  if (!canSeeReservations && !canSeeMoney) return null;
  return (
    <section className={classes.card}>
      <h2 className={classes.cardTitle}>{ta("فعالیت کاربر")}</h2>
      <ClientTabSystem
        items={[
          {
            id: "reservations",
            title: ta("نوبت‌ها"),
            exclude: !canSeeReservations,
            content: (
              <Suspense>
                <AdminManageReservationsPage scope={{ user: userId }} embedded />
              </Suspense>
            ),
          },
          {
            id: "orders",
            title: ta("سفارش‌ها"),
            exclude: !canSeeMoney,
            content: <UserOrders userId={userId} />,
          },
          {
            id: "wallet",
            title: ta("کیف پول"),
            exclude: !canSeeMoney,
            content: <UserWallet userId={userId} onChanged={onChanged} />,
          },
        ]}
      />
    </section>
  );
};

export default UserActivity;
