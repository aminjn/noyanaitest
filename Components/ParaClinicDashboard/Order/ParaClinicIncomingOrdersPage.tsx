"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import FormatDate from "@/Components/UI/FormatDate";
import OrderStatusBadge from "@/Components/Dashboard/Order/OrderStatusBadge";
import { OrderStatus } from "@/Components/Dashboard/Order/orderStatus";
import {
  earliestResponseDeadline,
  IOrderLineResponse,
  OrderItemStatus,
} from "@/Components/Dashboard/Order/orderItemStatus";
import OrderLineDeadline from "@/Components/Dashboard/Order/OrderLineDeadline";
import type { ISellerOrderMoney } from "@/Components/Order/SellerOrderMoney";

const NS: ContentNamespace[] = ["common", "paraClinicPanelOrder"];

// Shape returned by GET /paraClinic/order
// (paraClinicController.getMyIncomingOrders) and GET
// /paraClinic/order/:nodeId (paraClinicController.getMyIncomingOrder) - each
// order is already filtered down to just this paraClinic's own tests line
// items, plus a "subtotal" computed over only those items.
export interface IIncomingOrderItem extends IOrderLineResponse {
  _id?: string;
  item: { _id: string; test?: { _id: string; name?: string } };
  qty: number;
  price: number;
  status: OrderItemStatus;
  result?: { files?: string[]; note?: string; uploadedAt?: string };
}

export interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  tests: IIncomingOrderItem[];
  subtotal: number;
  pendingLines?: number;
  // this lab's money on the order (2026-10, backend Lib/orderSellerMoney.ts):
  // the list has the totals, the detail each line
  money?: ISellerOrderMoney;
}

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

const ParaClinicIncomingOrdersPage = () => {
  const getContent = useScopedLocale(NS);

  const { data, error } = useSWR<IIncomingOrder[]>(
    `${API}/paraClinic/order`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  useBreadCrump([
    { title: getContent("dashboard"), target: "/paraClinicPanel" },
    { title: getContent("incomingOrders"), target: "/paraClinicPanel/order" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("incomingOrders")}>
          <Table
            name="ParaClinicIncomingOrders"
            data={data}
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => (
                  <FormatDate value={new Date(node.submittedAt)} />
                ),
                filter: "Date",
              },
              buyer: {
                name: getContent("buyer"),
                value: (node) => buyerLabel(node),
                filter: "Text",
              },
              items: {
                name: getContent("orderItems"),
                value: (node) => (Array.isArray(node.tests) ? node.tests.length : 0),
                filter: "Number",
              },
              subtotal: {
                name: getContent("mySubtotal"),
                value: (node) => node.subtotal,
                component: (node) =>
                  `${currencize(node.subtotal)} ${getContent("toman")}`,
                filter: "Number",
              },
              // (2026-10) what the buyer paid and what this lab is paid for
              // its lines, after discounts, insurer and commission
              buyerPaid: {
                name: getContent("moneyBuyerPaid"),
                value: (node) => Number(node.money?.totals?.buyerPaid) || 0,
                component: (node) =>
                  node.money?.totals ? `${currencize(Number(node.money.totals.buyerPaid) || 0)} ${getContent("toman")}` : "-",
                filter: "Number",
              },
              payout: {
                name: getContent("moneyPayout"),
                value: (node) => Number(node.money?.totals?.payout) || 0,
                component: (node) =>
                  node.money?.totals ? `${currencize(Number(node.money.totals.payout) || 0)} ${getContent("toman")}` : "-",
                filter: "Number",
              },
              status: {
                name: getContent("ordersProgress"),
                value: (node) =>
                  node.pendingLines
                    ? getContent("ordersNeedAction", [String(node.pendingLines)])
                    : getContent("ordersAllDone"),
                filter: "Set",
              },
              // the earliest unanswered test's deadline (2026-10): past it
              // the line is cancelled and the buyer refunded
              respondBy: {
                name: getContent("orderRespondDeadline"),
                value: (node) => {
                  const at = earliestResponseDeadline(node.tests);
                  return at ? new Date(at) : "";
                },
                component: (node) => {
                  const at = earliestResponseDeadline(node.tests);
                  return at ? <OrderLineDeadline respondBy={at} audience="seller" /> : "-";
                },
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      title={getContent("view")}
                      href={`/paraClinicPanel/order/${node._id}`}
                    >
                      <EyeIcon />
                    </IconLink>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default ParaClinicIncomingOrdersPage;
