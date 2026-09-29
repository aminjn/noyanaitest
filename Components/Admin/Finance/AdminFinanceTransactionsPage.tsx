"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { IFinanceUser, transactionKindDict, userLabel } from "./adminFinance";

interface IAdminTransactionRow {
  _id: string;
  user: IFinanceUser | null;
  amount: number;
  createdAt?: string;
  kind: string;
  ref: string | null;
}

// The wallet ledger of every user: positive rows are credits (gateway
// top-ups, seller payouts, refunds), negative ones debits (orders, bookings,
// license purchases).
const AdminFinanceTransactionsPage = () => {
  const { data, error } = useSWR<IAdminTransactionRow[]>(
    `${API}/admin/finance/transactions`,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="تراکنش‌های کیف پول">
          <Table
            name="AdminFinanceTransactions"
            data={data}
            renderer={{
              user: {
                name: "کاربر",
                value: (node) => userLabel(node.user),
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {userLabel(node.user)}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              amount: {
                name: "مبلغ (تومان)",
                value: (node) => node.amount,
                component: (node) =>
                  `${node.amount > 0 ? "+" : node.amount < 0 ? "−" : ""}${currencize(Math.abs(node.amount || 0))}`,
                filter: "Number",
              },
              kind: {
                name: "بابت",
                value: (node) => transactionKindDict[node.kind] || node.kind,
                filter: "Set",
              },
              createdAt: {
                name: "تاریخ",
                value: (node) =>
                  node.createdAt ? new Date(node.createdAt) : undefined,
                filter: "Date",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminFinanceTransactionsPage;
