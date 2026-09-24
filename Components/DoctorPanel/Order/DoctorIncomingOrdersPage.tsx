"use client";

import useSWR from "swr";
import classes from "./DoctorIncomingOrdersPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
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
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelOrder"];

// Shape returned by GET /doctor/order (doctorController.getMyIncomingOrders)
// and GET /doctor/order/:nodeId (doctorController.getMyIncomingOrder) - each
// order is already filtered down to just this doctor's own
// services/servicePackages line items, plus a "subtotal" computed over only
// those items.
export interface IIncomingOrderItem {
  item: { _id: string; name?: string };
  qty: number;
  price: number;
  status: OrderItemStatus;
}

export interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  services: IIncomingOrderItem[];
  servicePackages: IIncomingOrderItem[];
  subtotal: number;
}

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

const itemCount = (order: IIncomingOrder) =>
  order.services.length + order.servicePackages.length;

const DoctorIncomingOrdersPage = () => {
  const getContent = useScopedLocale(NS);

  const { data, error } = useSWR<IIncomingOrder[]>(
    `${API}/doctor/order`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("incomingOrders"), target: "/doctorpanel/order" },
  ]);

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <WithTitle title={getContent("incomingOrders")}>
            <Table
              name="DoctorIncomingOrders"
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
                  value: (node) => itemCount(node),
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
                  component: (node) => (
                    <OrderStatusBadge status={node.status} />
                  ),
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconLink
                        title={getContent("view")}
                        href={`/doctorpanel/order/${node._id}`}
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
    </div>
  );
};

export default DoctorIncomingOrdersPage;
