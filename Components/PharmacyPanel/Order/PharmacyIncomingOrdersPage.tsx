"use client";

import useSWR from "swr";
import classes from "./PharmacyIncomingOrdersPage.module.css";
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

const NS: ContentNamespace[] = ["common", "pharmacyPanelOrder"];

// Shape returned by GET /pharmacy/order (pharmacyController.getMyIncomingOrders)
// and GET /pharmacy/order/:nodeId (pharmacyController.getMyIncomingOrder) -
// each order is already filtered down to just this pharmacy's own
// products/productPackages line items (an order's items can span several
// different sellers), plus a "subtotal" computed over only those items.
export interface IIncomingOrderProductItem {
  item: { _id: string; product?: { _id: string; name?: string } };
  qty: number;
  price: number;
  status: OrderItemStatus;
}

export interface IIncomingOrderPackageItem {
  item: { _id: string; name?: string };
  qty: number;
  price: number;
  status: OrderItemStatus;
}

export interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  products: IIncomingOrderProductItem[];
  productPackages: IIncomingOrderPackageItem[];
  // this pharmacy's shipment (backend Lib/delivery.ts)
  shipment?: {
    method: "tapsi" | "tipax";
    fee: number;
    payOnDelivery: boolean;
  };
  subtotal: number;
  // where to deliver (only the delivery fields of the buyer's address)
  address?: {
    displayName?: string;
    address?: string;
    receiverPhone?: string;
    postalCode?: string;
    location?: { coordinates?: number[] };
  };
}

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

const itemCount = (order: IIncomingOrder) =>
  order.products.length + order.productPackages.length;

const PharmacyIncomingOrdersPage = () => {
  const getContent = useScopedLocale(NS);

  const { data, error } = useSWR<IIncomingOrder[]>(
    `${API}/pharmacy/order`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("incomingOrders"), target: "/pharmacypanel/order" },
  ]);

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <WithTitle title={getContent("incomingOrders")}>
            <Table
              name="PharmacyIncomingOrders"
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
                        href={`/pharmacypanel/order/${node._id}`}
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

export default PharmacyIncomingOrdersPage;
