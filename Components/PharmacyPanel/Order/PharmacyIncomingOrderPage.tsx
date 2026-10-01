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
import { OrderItemStatus } from "@/Components/Dashboard/Order/orderItemStatus";
import { IIncomingOrder } from "./PharmacyIncomingOrdersPage";
import { localPhone } from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import { navigationUrl } from "@/Components/helpers/navigationUrl";

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
}

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
  })),
];

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

const MutateOrderItemPopup = ({
  nodeId,
  row,
  status,
  mutate,
}: {
  nodeId: string;
  row: OrderItemRow;
  status: Extract<OrderItemStatus, "fulfilled" | "cancelled">;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent(
          status === "fulfilled" ? "sureFulfillOrderItem" : "sureCancelOrderItem",
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
              {!!navigationUrl(data.address.location?.coordinates) && (
                <DataPair
                  title={getContent("locationOnMap")}
                  value={
                    <a
                      href={navigationUrl(data.address.location?.coordinates)}
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
          <Table
            name="PharmacyIncomingOrderItems"
            data={buildItemRows(data)}
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
                component: (node) => <OrderItemStatusBadge status={node.status} />,
              },
              actions: {
                name: getContent("actions"),
                component: (node) =>
                  node.status === "pending" ? (
                    <TableActions>
                      <IconButton
                        variant="Success"
                        title={getContent("fulfill")}
                        onClick={() =>
                          setPopup(
                            "FulfillIncomingOrderItem",
                            <MutateOrderItemPopup
                              nodeId={nodeId}
                              row={node}
                              status="fulfilled"
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
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default PharmacyIncomingOrderPage;
