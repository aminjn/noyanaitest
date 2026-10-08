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
import { OrderStatus } from "@/Components/Dashboard/Order/orderStatus";
import {
  earliestResponseDeadline,
  IOrderLineResponse,
  OrderItemStatus,
} from "@/Components/Dashboard/Order/orderItemStatus";
import OrderLineDeadline from "@/Components/Dashboard/Order/OrderLineDeadline";
import { IOrderLinePrescription } from "@/Components/Order/RxPrescription";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Badge from "@/Components/UI/Badge";

import type { IOrderShipment } from "@/Components/Order/orderShipment";

const NS: ContentNamespace[] = ["common", "pharmacyPanelOrder"];

// Shape returned by GET /pharmacy/order (pharmacyController.getMyIncomingOrders)
// and GET /pharmacy/order/:nodeId (pharmacyController.getMyIncomingOrder) -
// each order is already filtered down to just this pharmacy's own
// products/productPackages line items (an order's items can span several
// different sellers), plus a "subtotal" computed over only those items.
export interface IIncomingOrderProductItem extends IOrderLineResponse {
  item: { _id: string; product?: { _id: string; name?: string } };
  qty: number;
  price: number;
  status: OrderItemStatus;
  // prescription-only line (2026-10): approve its prescription first
  requiresPrescription?: boolean;
  prescription?: IOrderLinePrescription;
}

export interface IIncomingOrderPackageItem extends IOrderLineResponse {
  item: { _id: string; name?: string };
  qty: number;
  price: number;
  status: OrderItemStatus;
  requiresPrescription?: boolean;
  prescription?: IOrderLinePrescription;
}

export interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  products: IIncomingOrderProductItem[];
  productPackages: IIncomingOrderPackageItem[];
  // this pharmacy's shipment (backend Lib/delivery.ts)
  // (a Tipax parcel's delivery state, backend Services/shipmentDeliveryService.ts)
  shipment?: Pick<
    IOrderShipment,
    | "method"
    | "fee"
    | "payOnDelivery"
    | "trackingCode"
    | "shippedAt"
    | "confirmBy"
    | "deliveredAt"
    | "returnedAt"
    | "problem"
  >;
  // this pharmacy's lines still waiting on it
  pendingLines?: number;
  // Rx lines whose prescription waits on this pharmacy (2026-10)
  pendingPrescriptions?: number;
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
  (Array.isArray(order.products) ? order.products.length : 0) +
  (Array.isArray(order.productPackages) ? order.productPackages.length : 0);

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
                  name: getContent("ordersProgress"),
                  value: (node) =>
                    node.pendingLines
                      ? getContent("ordersNeedAction", [String(node.pendingLines)])
                      : getContent("ordersAllDone"),
                  filter: "Set",
                },
                // the earliest unanswered line's deadline (2026-10): past
                // it the line is cancelled and the buyer refunded
                respondBy: {
                  name: getContent("orderRespondDeadline"),
                  value: (node) => {
                    const at = earliestResponseDeadline([
                      ...(Array.isArray(node.products) ? node.products : []),
                      ...(Array.isArray(node.productPackages) ? node.productPackages : []),
                    ]);
                    return at ? new Date(at) : "";
                  },
                  component: (node) => {
                    const at = earliestResponseDeadline([
                      ...(Array.isArray(node.products) ? node.products : []),
                      ...(Array.isArray(node.productPackages) ? node.productPackages : []),
                    ]);
                    return at ? <OrderLineDeadline respondBy={at} audience="seller" /> : "-";
                  },
                },
                // prescriptions waiting on this pharmacy's check (2026-10)
                prescriptions: {
                  name: getContent("rxPrescription"),
                  value: (node) => node.pendingPrescriptions || 0,
                  component: (node) =>
                    node.pendingPrescriptions ? (
                      <Badge color="Warning" size="S">
                        {getContent("rxNeedReview", [String(node.pendingPrescriptions)])}
                      </Badge>
                    ) : (
                      "-"
                    ),
                  filter: "Number",
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
