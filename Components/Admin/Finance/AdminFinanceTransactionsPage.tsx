"use client";

import { API } from "@/Components/config";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { IFinanceUser, transactionKindDict, userLabel } from "./adminFinance";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "./FinanceListControls";
import { ta } from "@/Components/Admin/i18n/adminText";

interface IAdminTransactionRow {
  _id: string;
  user: IFinanceUser | null;
  amount: number;
  createdAt?: string;
  kind: string;
  ref: string | null;
  grossAmount?: number;
  commission?: number;
  commissionPercent?: number;
}

// The wallet ledger of every user: positive rows are credits (gateway
// top-ups, seller payouts, refunds), negative ones debits (orders, bookings,
// license purchases).
const TRANSACTIONS_PATH = `${API}/admin/finance/transactions`;

const directionDict: Record<string, string> = {
  get credit() {
    return ta("واریز (+)");
  },
  get debit() {
    return ta("برداشت (−)");
  },
};

const AdminFinanceTransactionsPage = () => {
  const state = useFinanceFilters({}, "kind");
  const { data: list, error, isValidating } =
    useFinanceList<IAdminTransactionRow>(TRANSACTIONS_PATH, state.query, state.page);
  const data = list?.rows;
  const commissionTotal = Number(list?.body.commissionTotal) || 0;
  return (
    <HandleLoading data={!!list} error={error}>
      {!!data && (
        <WithTitle title={ta("تراکنش‌های کیف پول")}>
          <p style={{ marginBottom: "1rem" }}>
            {ta("درآمد پلتفرم از کمیسیون (تسویه‌های این فیلتر): ${1} تومان", [currencize(commissionTotal)])}
          </p>
          <FinanceFilterBar
            state={state}
            searchPlaceholder={ta("موبایل، نام یا نام کاربری...")}
            status={{ title: ta("جهت"), options: directionDict }}
            extra={{ title: ta("بابت"), options: transactionKindDict }}
            exportPath={TRANSACTIONS_PATH}
            exportName="transactions"
          />
          <Table
            name="AdminFinanceTransactions"
            data={data}
            exportable={false}
            renderer={{
              user: {
                name: ta("کاربر"),
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
                name: ta("مبلغ (تومان)"),
                value: (node) => node.amount,
                component: (node) =>
                  `${node.amount > 0 ? "+" : node.amount < 0 ? "−" : ""}${currencize(Math.abs(node.amount || 0))}`,
                filter: "Number",
              },
              commission: {
                name: ta("کمیسیون نویان (تومان)"),
                value: (node) => node.commission || 0,
                component: (node) =>
                  node.commission
                    ? ta("${1} (${2}٪ از ${3})", [currencize(node.commission), node.commissionPercent ?? 0, currencize(node.grossAmount || 0)])
                    : "—",
                filter: "Number",
              },
              kind: {
                name: ta("بابت"),
                value: (node) => transactionKindDict[node.kind] || node.kind,
                filter: "Set",
              },
              createdAt: {
                name: ta("تاریخ"),
                value: (node) =>
                  node.createdAt ? new Date(node.createdAt) : undefined,
                filter: "Date",
              },
            }}
          />
          <FinancePager
            total={list.total}
            page={state.page}
            limit={list.limit}
            setPage={state.setPage}
            stale={isValidating}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminFinanceTransactionsPage;
