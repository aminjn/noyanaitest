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
import Act from "@/Components/UI/Act";
import FormatDate from "@/Components/UI/FormatDate";
import CheckIcon from "@/Components/Icons/CheckIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import OrderStatusBadge from "@/Components/Dashboard/Order/OrderStatusBadge";
import OrderItemStatusBadge from "@/Components/Dashboard/Order/OrderItemStatusBadge";
import { OrderItemStatus } from "@/Components/Dashboard/Order/orderItemStatus";
import { IIncomingOrder } from "./ParaClinicIncomingOrdersPage";

const NS: ContentNamespace[] = ["common", "paraClinicPanelOrder"];

interface OrderItemRow {
  key: string;
  itemId: string;
  name: string;
  qty: number;
  price: number;
  status: OrderItemStatus;
}

const buildItemRows = (order: IIncomingOrder): OrderItemRow[] =>
  (Array.isArray(order.tests) ? order.tests : []).map((t) => ({
    key: t.item._id,
    itemId: t.item._id,
    name: t.item.test?.name || t.item._id,
    qty: t.qty,
    price: t.price,
    status: t.status,
  }));

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

// paraClinic only ever mutates its "tests" array, unlike pharmacy/doctor
// which each have two item models - so no "model" field in the payload,
// mirroring paraClinicController.mutateIncomingOrderItem's schema.
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
        path={isLoading ? `${API}/paraClinic/order/${nodeId}` : null}
        method="PATCH"
        payload={{ itemId: row.itemId, status }}
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

const ParaClinicIncomingOrderPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IIncomingOrder>(
    `${API}/paraClinic/order/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/paraClinicPanel" },
    { title: getContent("incomingOrders"), target: "/paraClinicPanel/order" },
    {
      title: getContent("orderDetails"),
      target: `/paraClinicPanel/order/${nodeId}`,
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
          </List>
          <Table
            name="ParaClinicIncomingOrderItems"
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

export default ParaClinicIncomingOrderPage;
