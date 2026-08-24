"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import PopupCard from "@/Components/UI/PopupCard";
import FormatDate from "@/Components/UI/FormatDate";
import OrderStatusBadge from "@/Components/Dashboard/Order/OrderStatusBadge";
import { OrderStatus } from "@/Components/Dashboard/Order/orderStatus";

// Shape returned by GET /paraClinic/order
// (paraClinicController.getMyIncomingOrders) - each order is already
// filtered down to just this paraClinic's own tests line items, plus a
// "subtotal" computed over only those items.
interface IIncomingOrderItem {
  item: { _id: string; test?: { _id: string; name?: string } };
  qty: number;
  price: number;
}

interface IIncomingOrder extends MongoDoc {
  user: { _id: string; username?: string; phone: string };
  submittedAt: string;
  status: OrderStatus;
  tests: IIncomingOrderItem[];
  subtotal: number;
}

const buyerLabel = (order: IIncomingOrder) =>
  order.user?.username || order.user?.phone || "";

const IncomingOrderItemsPopup = ({ order }: { order: IIncomingOrder }) => {
  const getContent = useLocale();

  const items = order.tests.map((t) => ({
    _id: t.item._id,
    name: t.item.test?.name || t.item._id,
    qty: t.qty,
    price: t.price,
  }));

  return (
    <PopupCard>
      <WithTitle title={getContent("orderDetails")}>
        <Table
          name="ParaClinicIncomingOrderItems"
          data={items}
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
          }}
        />
      </WithTitle>
    </PopupCard>
  );
};

const ParaClinicIncomingOrdersPage = () => {
  const getContent = useLocale();

  const { data, error } = useSWR<IIncomingOrder[]>(
    `${API}/paraClinic/order`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();

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
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "ParaClinicIncomingOrderItems",
                          <IncomingOrderItemsPopup order={node} />,
                        )
                      }
                    >
                      <EyeIcon />
                    </IconButton>
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
