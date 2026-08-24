"use client";

import useSWR from "swr";
import classes from "./DashboardManageOrdersPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import useLocale from "@/Components/Hooks/useLocale";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { MongoDoc } from "@/Components/Hooks/useUser";
import OrderStatusBadge from "./OrderStatusBadge";
import { OrderStatus } from "./orderStatus";

// Unpopulated shape returned by GET /user/order (list) — mirrors Models/
// Order.ts on noyanai-back. The item arrays only need their length here
// (item count column); the full populated items are only fetched on the
// single-order detail view (Components/Order/OrderConfirmationPage.tsx,
// reused here as the "view" action target).
interface IOrderListItem extends MongoDoc {
  products: { item: string; qty: number; price: number }[];
  productPackages: { item: string; qty: number; price: number }[];
  services: { item: string; qty: number; price: number }[];
  servicePackages: { item: string; qty: number; price: number }[];
  tests: { item: string; qty: number; price: number }[];
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  submittedAt: string;
  paidAt?: string;
}

const itemCount = (order: IOrderListItem) =>
  order.products.length +
  order.productPackages.length +
  order.services.length +
  order.servicePackages.length +
  order.tests.length;

const DashboardManageOrdersPage = () => {
  const getContent = useLocale();

  const { data, error } = useSWR<IOrderListItem[]>(
    `${API}/user/order`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <Table
            name="DashboardManageOrders"
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
              items: {
                name: getContent("orderItems"),
                value: (node) => itemCount(node),
                filter: "Number",
              },
              total: {
                name: getContent("total"),
                value: (node) => node.total,
                component: (node) =>
                  `${currencize(node.total)} ${getContent("toman")}`,
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
                    <IconLink href={`/order/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
                  </TableActions>
                ),
              },
            }}
          />
        )}
      </HandleLoading>
    </div>
  );
};

export default DashboardManageOrdersPage;
