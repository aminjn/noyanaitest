"use client";

import { useSearchParams } from "next/navigation";
import { API } from "@/Components/config";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "./FinanceListControls";
import {
  lineStatusDict,
  IFinanceUser,
  orderStatusDict,
  paymentMethodDict,
  userLabel,
} from "./adminFinance";
import { ta } from "@/Components/Admin/i18n/adminText";

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
  deliveryFee?: number;
  lines: number;
  pending?: number;
  fulfilled: number;
  cancelled: number;
}

const ORDERS_PATH = `${API}/admin/finance/orders`;

// Every store order (products, packages, services, tests) with its payment
// state and how far its sellers got. Server-paged (2026-10); each row opens
// the order page (lines, sellers, delivery, refunds, cancel). `?lineStatus=
// pending` lists the orders still waiting on a seller.
const AdminFinanceOrdersPage = () => {
  const params = useSearchParams();
  const state = useFinanceFilters(
    {
      status: params.get("status") || "",
      extra: params.get("lineStatus") || "",
    },
    "lineStatus",
  );
  const { data: list, error, isValidating } = useFinanceList<IAdminOrderRow>(
    ORDERS_PATH,
    state.query,
    state.page,
  );
  const data = list?.rows;
  return (
    <HandleLoading data={!!list} error={error}>
      {!!data && (
        <WithTitle title={ta("سفارش‌ها")}>
          <FinanceFilterBar
            state={state}
            searchPlaceholder={ta("شماره سفارش، موبایل یا نام خریدار...")}
            status={{ title: ta("وضعیت پرداخت"), options: orderStatusDict }}
            extra={{ title: ta("وضعیت اقلام"), options: lineStatusDict }}
            exportPath={ORDERS_PATH}
            exportName="orders"
          />
          <Table
toolbar={false}
            name="AdminFinanceOrders"
            data={data}
            exportable={false}
            renderer={{
              _id: {
                name: ta("شماره سفارش"),
                value: (node) => node._id.slice(-8),
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/finance/orders/${node._id}`)}>
                    {node._id.slice(-8)}
                  </InlineLink>
                ),
              },
              user: {
                name: ta("خریدار"),
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
                name: ta("مبلغ کل (تومان)"),
                value: (node) => node.total,
                component: (node) => currencize(node.total || 0),
                filter: "Number",
              },
              tax: {
                name: ta("مالیات (تومان)"),
                value: (node) => node.tax,
                component: (node) => currencize(node.tax || 0),
                filter: "Number",
              },
              paymentMethod: {
                name: ta("روش پرداخت"),
                value: (node) =>
                  paymentMethodDict[node.paymentMethod] || node.paymentMethod,
                filter: "Set",
              },
              status: {
                name: ta("وضعیت پرداخت"),
                value: (node) => orderStatusDict[node.status] || node.status,
                filter: "Set",
              },
              lines: {
                name: ta("اقلام"),
                value: (node) =>
                  ta("${1} قلم، ${2} تحویل، ${3} لغو", [node.lines, node.fulfilled, node.cancelled]),
              },
              pending: {
                name: ta("در انتظار فروشنده"),
                value: (node) => node.pending ?? 0,
                filter: "Number",
              },
              submittedAt: {
                name: ta("تاریخ ثبت"),
                value: (node) =>
                  node.submittedAt ? new Date(node.submittedAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/finance/orders/${node._id}`)}
                      title={ta("جزئیات سفارش")}
                    >
                      <EyeIcon />
                    </IconLink>
                  </TableActions>
                ),
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

export default AdminFinanceOrdersPage;
