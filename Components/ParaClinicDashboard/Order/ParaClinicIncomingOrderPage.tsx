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
import {
  IOrderLineResponse,
  OrderItemStatus,
  pendingResponseDeadline,
} from "@/Components/Dashboard/Order/orderItemStatus";
import OrderLineDeadline from "@/Components/Dashboard/Order/OrderLineDeadline";
import HandThumbUpIcon from "@/Components/Icons/HandThumbUpIcon";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { IIncomingOrder, IIncomingOrderItem } from "./ParaClinicIncomingOrdersPage";
import LabResultPopup from "./LabResultPopup";
import AttachmentIcon from "@/Components/Icons/AttachmentIcon";
import labClasses from "./LabResult.module.css";
import { OrderSamplings } from "@/Components/LabSampling/SamplingInfo";
import SamplingActions from "@/Components/LabSampling/SamplingActions";
import { SamplingMoveInfo } from "@/Components/LabSampling/samplingTypes";
import useAcl from "@/Components/Hooks/useAcl";
import SellerOrderMoney from "@/Components/Order/SellerOrderMoney";

const NS: ContentNamespace[] = ["common", "paraClinicPanelOrder"];

interface OrderItemRow {
  key: string;
  itemId: string;
  name: string;
  qty: number;
  price: number;
  status: OrderItemStatus;
  lineId?: string;
  result?: IIncomingOrderItem["result"];
  // response deadline still running, the lab's acceptance, auto-cancel
  respondBy: string | null;
  acceptedAt?: string;
  autoCancel?: IOrderLineResponse["autoCancel"];
}

// "accepted" answers the line (backend Lib/orderResponse.ts); it stays
// pending until its result is given and it is marked done
type OrderItemAction = "accepted" | "fulfilled" | "cancelled";

const confirmKey: Record<OrderItemAction, ContentKey> = {
  accepted: "sureAcceptOrderItem",
  fulfilled: "sureFulfillOrderItem",
  cancelled: "sureCancelOrderItem",
};

const buildItemRows = (order: IIncomingOrder): OrderItemRow[] =>
  (Array.isArray(order.tests) ? order.tests : [])
    .filter((t) => t?.item?._id)
    .map((t) => ({
    key: t.item._id,
    itemId: t.item._id,
    name: t.item.test?.name || t.item._id,
    qty: t.qty,
    price: t.price,
    status: t.status,
    lineId: t._id,
    result: t.result,
    respondBy: pendingResponseDeadline(t),
    acceptedAt: t.acceptedAt,
    autoCancel: t.autoCancel,
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
  status: OrderItemAction;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent(confirmKey[status])}
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
  // moving a sampling appointment is an order action (mutateOrders)
  const canMutate = useAcl("paraClinic")("mutateOrders");
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
          {/* the sampling appointment(s) of these tests (2026-10): when,
              and for a home visit where; confirmed from the agenda or by
              accepting a line */}
          <OrderSamplings
            lines={data.tests as never}
            viewer="lab"
            renderActions={(sampling) =>
              canMutate ? (
                <SamplingActions
                  sampling={sampling}
                  info={(data as IIncomingOrder & { samplingMoves?: Record<string, SamplingMoveInfo> }).samplingMoves?.[sampling._id]}
                  viewer="lab"
                  onMove={async (payload) => {
                    await fetcher({
                      url: `${API}/paraClinic/sampling/${sampling._id}`,
                      method: "PATCH",
                      payload: { action: "reschedule", ymd: payload.ymd, start: payload.start },
                    });
                    await mutate();
                  }}
                  onPropose={async (payload) => {
                    await fetcher({
                      url: `${API}/paraClinic/sampling/${sampling._id}`,
                      method: "PATCH",
                      payload: { action: "propose", ...payload },
                    });
                    await mutate();
                  }}
                  onWithdrawProposal={async () => {
                    await fetcher({
                      url: `${API}/paraClinic/sampling/${sampling._id}`,
                      method: "PATCH",
                      payload: { action: "withdrawProposal" },
                    });
                    await mutate();
                  }}
                />
              ) : null
            }
          />
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
                component: (node) => (
                  <span>
                    <OrderItemStatusBadge
                      status={node.status}
                      acceptedAt={node.acceptedAt}
                      autoCancel={node.autoCancel}
                    />
                    <OrderLineDeadline respondBy={node.respondBy} audience="seller" />
                  </span>
                ),
              },
              result: {
                name: getContent("labResult"),
                component: (node) => (
                  <span className={labClasses.files}>
                    {(Array.isArray(node.result?.files) ? node.result.files : []).map((id, i) => (
                      <a key={id} href={`/api/v1/notpublic/${id}`} target="_blank" rel="noreferrer">
                        {getContent("labResultFile", [String(i + 1)])}
                      </a>
                    ))}
                  </span>
                ),
              },
              actions: {
                name: getContent("actions"),
                component: (node) =>
                  node.status === "pending" ? (
                    <TableActions>
                      {/* take the order first (stops the automatic cancel);
                          a result upload also counts as an answer */}
                      {!node.acceptedAt && !node.result?.uploadedAt && (
                        <IconButton
                          variant="Info"
                          title={getContent("orderAccept")}
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
                      {!!node.lineId && (
                        <IconButton
                          title={getContent("labUpload")}
                          onClick={() =>
                            setPopup(
                              "LabResult",
                              <LabResultPopup orderId={nodeId} lineId={node.lineId || ""} onDone={() => mutate()} />,
                            )
                          }
                        >
                          <AttachmentIcon />
                        </IconButton>
                      )}
                      {/* a test is done once its result reached the
                          patient: the server refuses "done" before that */}
                      <IconButton
                        variant="Success"
                        title={getContent(node.result?.uploadedAt ? "fulfill" : "labResultFirst")}
                        disabled={!node.result?.uploadedAt}
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
                  ) : node.status === "fulfilled" && !!node.lineId ? (
                    <TableActions>
                      <IconButton
                        title={getContent("labUpload")}
                        onClick={() =>
                          setPopup(
                            "LabResult",
                            <LabResultPopup orderId={nodeId} lineId={node.lineId || ""} onDone={() => mutate()} />,
                          )
                        }
                      >
                        <AttachmentIcon />
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
              (Array.isArray(data.tests) ? data.tests : [])
                .map((t) => [t?._id || "", t?.item?.test?.name || ""] as [string, string])
                .filter(([id]) => !!id),
            )}
            tableName="ParaClinicIncomingOrderMoney"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default ParaClinicIncomingOrderPage;
