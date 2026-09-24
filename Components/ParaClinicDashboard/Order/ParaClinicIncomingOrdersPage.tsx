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
import { OrderItemStatus } from "@/Components/Dashboard/Order/orderItemStatus";

const NS: ContentNamespace[] = ["common", "paraClinicPanelOrder"];

// Shape returned by GET /paraClinic/order
// (paraClinicController.getMyIncomingOrders) and GET
// /paraClinic/order/:nodeId (paraClinicController.getMyIncomingOrder) - each
// order is already filtered down to just this paraClinic's own tests line
// items, plus a "subtotal" computed over only those items.
export interface IIncomingOrderItem {
  item: { _id: string; test?: { _id: string; name?: string } };
  qty: number;
  price: number;
  status: OrderItemStatus;
}

export interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  tests: IIncomingOrderItem[];
  subtotal: number;
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
                value: (node) => node.tests.length,
                filter: "Number",
              },
              subtotal: {
                name: getContent("mySubtotal"),
                value: (node) => node.subtotal,
                component: (node) =>
                  `${currencize(node.subtotal)} ${getContent("toman")}`,
                filter: "Number",
              },
              status: {
                name: getContent("status"),
                value: (node) => node.status,
                filter: "Set",
                component: (node) => <OrderStatusBadge status={node.status} />,
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
