"use client";

import { Fragment, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import List from "@/Components/Admin/UI/List";
import DataPair from "@/Components/Admin/UI/DataPair";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import PopupCard from "@/Components/UI/PopupCard";
import Act from "@/Components/UI/Act";
import FormatDate from "@/Components/UI/FormatDate";
import CheckIcon from "@/Components/Icons/CheckIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import OrderStatusBadge from "@/Components/Dashboard/Order/OrderStatusBadge";
import OrderItemStatusBadge from "@/Components/Dashboard/Order/OrderItemStatusBadge";
import {
  IOrderLineResponse,
  OrderItemStatus,
  pendingResponseDeadline,
} from "@/Components/Dashboard/Order/orderItemStatus";
import OrderLineDeadline from "@/Components/Dashboard/Order/OrderLineDeadline";
import HandThumbUpIcon from "@/Components/Icons/HandThumbUpIcon";
import { IIncomingOrder } from "./PharmacyIncomingOrdersPage";
import { localPhone } from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import useNavigationUrl from "@/Components/Hooks/useNavigationUrl";
import ShipmentSender from "./ShipmentSender";
import RxReviewPopup from "./RxReviewPopup";
import {
  IOrderLinePrescription,
  RxPrescriptionDetails,
  RxStatusBadge,
  rxStatusOf,
} from "@/Components/Order/RxPrescription";
import { ContentKey } from "@/Components/Enums/contentKeys";
import DocumentIcon from "@/Components/Icons/DocumentIcon";
import SellerOrderMoney from "@/Components/Order/SellerOrderMoney";

const NS: ContentNamespace[] = ["common", "pharmacyPanelOrder"];

// Models this pharmacy can fulfill/cancel items in - mirrors the "model"
// enum accepted by PATCH /pharmacy/order/:nodeId
// (pharmacyController.mutateIncomingOrderItem).
type IncomingOrderItemModel = "products" | "productPackages";

interface OrderItemRow {
  key: string;
  model: IncomingOrderItemModel;
  itemId: string;
  name: string;
  qty: number;
  price: number;
  status: OrderItemStatus;
  // prescription-only (2026-10): fulfilled only once its prescription is approved
  prescription?: IOrderLinePrescription;
  // response deadline still running, the seller's acceptance, auto-cancel
  respondBy: string | null;
  acceptedAt?: string;
  autoCancel?: IOrderLineResponse["autoCancel"];
}

// "accepted" answers the line (backend Lib/orderResponse.ts); it stays
// pending until fulfilled or cancelled
type OrderItemAction = "accepted" | "fulfilled" | "cancelled";

const confirmKey: Record<OrderItemAction, ContentKey> = {
  accepted: "sureAcceptOrderItem",
  fulfilled: "sureFulfillOrderItem",
  cancelled: "sureCancelOrderItem",
};

// How this pharmacy's parcel leaves (backend Lib/shipmentDelivery.ts): in a
// Tipax parcel not confirmed delivered, "fulfilled" means prepared - the
// payout waits for the delivery; a Tapsi line is delivered when fulfilled.
type LineShipping = "tipax" | "tapsi" | null;

const shippingOf = (order?: IIncomingOrder): LineShipping => {
  const s = order?.shipment;
  if (!s) return null;
  if (s.method === "tipax") return s.deliveredAt || s.returnedAt ? null : "tipax";
  return s.method === "tapsi" ? "tapsi" : null;
};

const fulfilConfirmKey: Record<"tipax" | "tapsi", ContentKey> = {
  tipax: "sureFulfillOrderItemTipax",
  tapsi: "sureFulfillOrderItemTapsi",
};

const buildItemRows = (order: IIncomingOrder): OrderItemRow[] => [
  ...(Array.isArray(order.products) ? order.products : [])
    .filter((p) => p?.item?._id)
    .map((p) => ({
    key: `products:${p.item._id}`,
    model: "products" as const,
    itemId: p.item._id,
    name: p.item.product?.name || p.item._id,
    qty: p.qty,
    price: p.price,
    status: p.status,
    prescription: p.requiresPrescription ? p.prescription || { kind: "erx" as const } : undefined,
    respondBy: pendingResponseDeadline(p),
    acceptedAt: p.acceptedAt,
    autoCancel: p.autoCancel,
  })),
  ...(Array.isArray(order.productPackages) ? order.productPackages : [])
    .filter((p) => p?.item?._id)
    .map((p) => ({
    key: `productPackages:${p.item._id}`,
    model: "productPackages" as const,
    itemId: p.item._id,
    name: p.item.name || p.item._id,
    qty: p.qty,
    price: p.price,
    status: p.status,
    prescription: p.requiresPrescription ? p.prescription || { kind: "erx" as const } : undefined,
    respondBy: pendingResponseDeadline(p),
    acceptedAt: p.acceptedAt,
    autoCancel: p.autoCancel,
  })),
];

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

const MutateOrderItemPopup = ({
  nodeId,
  row,
  status,
  shipping = null,
  mutate,
}: {
  nodeId: string;
  row: OrderItemRow;
  status: OrderItemAction;
  shipping?: LineShipping;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent(
          status === "fulfilled" && shipping ? fulfilConfirmKey[shipping] : confirmKey[status],
        )}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/pharmacy/order/${nodeId}` : null}
        method="PATCH"
        payload={{ model: row.model, itemId: row.itemId, status }}
        onDone={(ok) => {
          setIsLoading(false);
          if (!ok) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const PharmacyIncomingOrderPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IIncomingOrder>(
    `${API}/pharmacy/order/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);
  // NexaMap (the super admin's link format) or our route page
  const { href: navHref } = useNavigationUrl(data?.address?.location?.coordinates);
  const t = (key: string) => getContent(key as ContentKey);
  const rows = data ? buildItemRows(data) : [];
  const rxRows = rows.filter((row) => !!row.prescription);
  const shipping = shippingOf(data);
  const openRx = (row: OrderItemRow, decision: "approve" | "reject") =>
    setPopup(
      decision === "approve" ? "ApproveIncomingOrderRx" : "RejectIncomingOrderRx",
      <RxReviewPopup
        orderId={nodeId}
        model={row.model}
        itemId={row.itemId}
        name={row.name}
        prescription={row.prescription}
        decision={decision}
        onDone={() => mutate()}
      />,
    );

  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
    { title: getContent("incomingOrders"), target: "/pharmacypanel/order" },
    {
      title: getContent("orderDetails"),
      target: `/pharmacypanel/order/${nodeId}`,
    },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("orderDetails")}>
          <List>
            <DataPair
              title={getContent("submittedAt")}
              value={<FormatDate value={new Date(data.submittedAt)} />}
            />
            <DataPair title={getContent("buyer")} value={buyerLabel(data)} />
            <DataPair
              title={getContent("status")}
              value={<OrderStatusBadge status={data.status} />}
            />
            <DataPair
              title={getContent("mySubtotal")}
              value={`${currencize(data.subtotal)} ${getContent("toman")}`}
            />
            {!!data.shipment && (
              <DataPair
                title={getContent("shippingMethod")}
                value={
                  <span>
                    {getContent(
                      data.shipment.method === "tapsi"
                        ? "shippingTapsi"
                        : "shippingTipax",
                    )}
                    <br />
                    <small>
                      {data.shipment.method === "tapsi"
                        ? getContent("pharmacyShipTapsiNote", [
                            currencize(data.shipment.fee || 0),
                          ])
                        : getContent("pharmacyShipTipaxNote")}
                    </small>
                  </span>
                }
              />
            )}
          </List>
          {!!data.shipment && (
            <ShipmentSender orderId={data._id} shipment={data.shipment} onDone={() => mutate()} />
          )}
          {!!data.address?.address && (
            <List>
              <DataPair
                title={getContent("deliveryAddress")}
                value={[data.address.displayName, data.address.address].filter(Boolean).join(" - ")}
              />
              {!!data.address.receiverPhone && (
                <DataPair
                  title={getContent("receiverPhone")}
                  value={
                    <a href={`tel:+${data.address.receiverPhone}`} dir="ltr">
                      {localPhone(data.address.receiverPhone)}
                    </a>
                  }
                />
              )}
              {!!data.address.postalCode && (
                <DataPair title={getContent("postalCode")} value={data.address.postalCode} />
              )}
              {!!navHref && (
                <DataPair
                  title={getContent("locationOnMap")}
                  value={
                    <a
                      href={navHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getContent("navigate")}
                    </a>
                  }
                />
              )}
            </List>
          )}
          {!!rxRows.length && (
            <List>
              {rxRows.map((row) => (
                <DataPair
                  key={`rx:${row.key}`}
                  title={`${t("rxPrescriptionOf")} ${row.name}`}
                  value={<RxPrescriptionDetails prescription={row.prescription} />}
                />
              ))}
            </List>
          )}
          <Table
            name="PharmacyIncomingOrderItems"
            data={rows}
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.name,
                filter: "Text",
              },
              qty: {
                name: getContent("quantity"),
                value: (node) => node.qty,
                filter: "Number",
              },
              price: {
                name: getContent("price"),
                value: (node) => node.price,
                component: (node) =>
                  `${currencize(node.price)} ${getContent("toman")}`,
                filter: "Number",
              },
              total: {
                name: getContent("total"),
                value: (node) => node.qty * node.price,
                component: (node) =>
                  `${currencize(node.qty * node.price)} ${getContent("toman")}`,
                filter: "Number",
              },
              status: {
                name: getContent("status"),
                value: (node) => node.status,
                filter: "Set",
                component: (node) => (
                  <span>
                    <OrderItemStatusBadge
                      status={node.status}
                      acceptedAt={node.acceptedAt}
                      autoCancel={node.autoCancel}
                      // every line here ships in this pharmacy's one parcel
                      shipping={
                        data?.shipment?.method === "tipax" &&
                        !data.shipment.deliveredAt &&
                        !data.shipment.returnedAt
                          ? data.shipment.shippedAt
                            ? "inTransit"
                            : "ready"
                          : undefined
                      }
                    />
                    <OrderLineDeadline respondBy={node.respondBy} audience="seller" />
                  </span>
                ),
              },
              prescription: {
                name: t("rxPrescription"),
                value: (node) => (node.prescription ? rxStatusOf(node.prescription) : ""),
                component: (node) =>
                  node.prescription ? <RxStatusBadge prescription={node.prescription} /> : "-",
              },
              actions: {
                name: getContent("actions"),
                component: (node) =>
                  // an Rx line waits on its prescription: approve or reject it
                  // first (rejecting cancels and refunds the line)
                  node.status === "pending" &&
                  node.prescription &&
                  rxStatusOf(node.prescription) === "pending" ? (
                    <TableActions>
                      <IconButton
                        variant="Success"
                        title={t("rxApprove")}
                        onClick={() => openRx(node, "approve")}
                      >
                        <DocumentIcon />
                      </IconButton>
                      <IconButton
                        variant="Danger"
                        title={t("rxReject")}
                        onClick={() => openRx(node, "reject")}
                      >
                        <XMarkIcon />
                      </IconButton>
                    </TableActions>
                  ) : node.status === "pending" ? (
                    <TableActions>
                      {/* answer the line first (stops the automatic
                          cancel), or fulfil it straight away */}
                      {!node.acceptedAt && !node.prescription && (
                        <IconButton
                          variant="Info"
                          title={t("orderAccept")}
                          onClick={() =>
                            setPopup(
                              "AcceptIncomingOrderItem",
                              <MutateOrderItemPopup
                                nodeId={nodeId}
                                row={node}
                                status="accepted"
                                mutate={mutate}
                              />,
                            )
                          }
                        >
                          <HandThumbUpIcon />
                        </IconButton>
                      )}
                      <IconButton
                        variant="Success"
                        title={getContent(shipping === "tipax" ? "ioMarkPrepared" : "fulfill")}
                        onClick={() =>
                          setPopup(
                            "FulfillIncomingOrderItem",
                            <MutateOrderItemPopup
                              nodeId={nodeId}
                              row={node}
                              status="fulfilled"
                              shipping={shipping}
                              mutate={mutate}
                            />,
                          )
                        }
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        variant="Danger"
                        title={getContent("ioMarkCancel")}
                        onClick={() =>
                          setPopup(
                            "CancelIncomingOrderItem",
                            <MutateOrderItemPopup
                              nodeId={nodeId}
                              row={node}
                              status="cancelled"
                              mutate={mutate}
                            />,
                          )
                        }
                      >
                        <XMarkIcon />
                      </IconButton>
                    </TableActions>
                  ) : null,
              },
            }}
          />
          {/* (2026-10) the money of each line and of the order */}
          <SellerOrderMoney
            money={data.money}
            names={Object.fromEntries(
              [
                ...(Array.isArray(data.products) ? data.products : []).map(
                  (p) => [p?._id || "", p?.item?.product?.name || ""] as [string, string],
                ),
                ...(Array.isArray(data.productPackages) ? data.productPackages : []).map(
                  (p) => [p?._id || "", p?.item?.name || ""] as [string, string],
                ),
              ].filter(([id]) => !!id),
            )}
            tableName="PharmacyIncomingOrderMoney"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default PharmacyIncomingOrderPage;
