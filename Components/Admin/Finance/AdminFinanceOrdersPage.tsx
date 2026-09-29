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
import {
  IFinanceUser,
  orderStatusDict,
  paymentMethodDict,
  userLabel,
} from "./adminFinance";

interface IAdminOrderRow {
  _id: string;
  user: IFinanceUser | null;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  submittedAt?: string;
  paidAt?: string;
  lines: number;
  fulfilled: number;
  cancelled: number;
}

// Every store order (products, packages, services, tests) with its payment
// state and how far its sellers got - read-only; sellers fulfil or cancel
// their own lines from their panels.
const AdminFinanceOrdersPage = () => {
  const { data, error } = useSWR<IAdminOrderRow[]>(
    `${API}/admin/finance/orders`,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="سفارش‌ها">
          <Table
            name="AdminFinanceOrders"
            data={data}
            renderer={{
              _id: {
                name: "شماره سفارش",
                value: (node) => node._id.slice(-8),
                filter: "Text",
              },
              user: {
                name: "خریدار",
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
              total: {
                name: "مبلغ کل (تومان)",
                value: (node) => node.total,
                component: (node) => currencize(node.total || 0),
                filter: "Number",
              },
              tax: {
                name: "مالیات (تومان)",
                value: (node) => node.tax,
                component: (node) => currencize(node.tax || 0),
                filter: "Number",
              },
              paymentMethod: {
                name: "روش پرداخت",
                value: (node) =>
                  paymentMethodDict[node.paymentMethod] || node.paymentMethod,
                filter: "Set",
              },
              status: {
                name: "وضعیت پرداخت",
                value: (node) => orderStatusDict[node.status] || node.status,
                filter: "Set",
              },
              lines: {
                name: "اقلام",
                value: (node) =>
                  `${node.lines} قلم، ${node.fulfilled} تحویل، ${node.cancelled} لغو`,
              },
              submittedAt: {
                name: "تاریخ ثبت",
                value: (node) =>
                  node.submittedAt ? new Date(node.submittedAt) : undefined,
                filter: "Date",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminFinanceOrdersPage;
