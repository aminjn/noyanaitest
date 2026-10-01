"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import classes from "./OrderConfirmationPage.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import { currencize } from "../helpers/currencize";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import Button from "../UI/Button";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import { ContentKey } from "../Enums/contentKeys";
import { CartModel, cartModels } from "../Hooks/useCart";
import { MongoDoc } from "../Hooks/useUser";
import {
  IProductSeller,
  ProductSellerPopulation,
} from "../Admin/Product/AdminManageProductsPage";
import {
  IProductPackage,
  ProductPackagePopulation,
} from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import {
  IService,
  ServicePopulation,
} from "../Admin/Service/AdminManageServicesPage";
import {
  IServicePackage,
  ServicePackagePopulation,
} from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import {
  IParaClinicTest,
  ParaClinicTestPopulation,
} from "../Admin/ParaClinic/AdminManageParaClinicPage";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";
import OrderItemStatusBadge from "../Dashboard/Order/OrderItemStatusBadge";
import { OrderItemStatus } from "../Dashboard/Order/orderItemStatus";
import usePopup from "../Hooks/usePopup";
import useNotification from "../Hooks/useNotification";
import ConfirmationPopup from "../Admin/UI/ConfirmationPopup";
import { useRef, useState } from "react";
import {
  t2xsRegular,
  tlgBold,
  tmdDemiBold,
  tsmRegular,
} from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "orderConfirmation", "dashboardOrderItemStatusBadge"];

export const orderStatuses = ["pending", "paid", "cancelled"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderPopulation = Population<{
  Products: ProductSellerPopulation;
  ProductPackages: ProductPackagePopulation;
  Services: ServicePopulation;
  ServicePackages: ServicePackagePopulation;
  Tests: ParaClinicTestPopulation;
}>;

export interface IOrder<
  T extends OrderPopulation = OrderPopulation,
> extends MongoDoc {
  products: {
    item: T["Products"] extends ProductSellerPopulation
      ? IProductSeller<T["Products"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  }[];
  productPackages: {
    item: T["ProductPackages"] extends ProductPackagePopulation
      ? IProductPackage<T["ProductPackages"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  }[];
  services: {
    item: T["Services"] extends ServicePopulation
      ? IService<T["Services"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  }[];
  servicePackages: {
    item: T["ServicePackages"] extends ServicePackagePopulation
      ? IServicePackage<T["ServicePackages"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  }[];
  tests: {
    item: T["Tests"] extends ParaClinicTestPopulation
      ? IParaClinicTest<T["Tests"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  }[];
  total: number;
  // one per pharmacy (backend Lib/delivery.ts); Tapsi's fee is in `total`
  shipments?: {
    _id: string;
    pharmacy?: { _id: string; name?: string } | string;
    method: "tapsi" | "tipax";
    fee: number;
    payOnDelivery: boolean;
    trackingCode?: string;
    shippedAt?: string;
  }[];
  deliveryFee?: number;
  paymentMethod: "wallet" | "sep";
  status: OrderStatus;
  address?: IUserAddress;
  submittedAt: string;
  paidAt?: string;
}

type OrderNode = IOrder<{
  Products: { Seller: Record<never, never>; Product: Record<never, never> };
  ProductPackages: Record<never, never>;
  Services: Record<never, never>;
  ServicePackages: Record<never, never>;
  Tests: { Test: Record<never, never>; ParaClinic: Record<never, never> };
}>;

type OrderRow = {
  itemId: string;
  model: CartModel;
  image?: string;
  title: string;
  subtitle?: string;
  price: number;
  qty: number;
  status?: OrderItemStatus;
};

const sectionTitle: Record<CartModel, ContentKey> = {
  products: "products",
  productPackages: "productPackages",
  services: "services",
  servicePackages: "servicePackages",
  tests: "tests",
};

const statusContent: Record<OrderStatus, ContentKey> = {
  pending: "orderStatusPending",
  paid: "orderStatusPaid",
  cancelled: "orderStatusCancelled",
};

const buildRows = (order: OrderNode): OrderRow[] => {
  const rows: OrderRow[] = [];

  (Array.isArray(order.products) ? order.products : []).forEach(({ item, qty, price, status }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "products",
      image: item.product?.image,
      title: item.product?.name || "",
      subtitle: item.seller?.name,
      price,
      qty,
      status,
    });
  });

  (Array.isArray(order.productPackages) ? order.productPackages : []).forEach(({ item, qty, price, status }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "productPackages",
      image: item.image,
      title: item.name || "",
      price,
      qty,
      status,
    });
  });

  (Array.isArray(order.services) ? order.services : []).forEach(({ item, qty, price, status }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "services",
      image: item.image,
      title: item.name || "",
      price,
      qty,
      status,
    });
  });

  (Array.isArray(order.servicePackages) ? order.servicePackages : []).forEach(({ item, qty, price, status }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "servicePackages",
      image: item.image,
      title: item.name || "",
      price,
      qty,
      status,
    });
  });

  (Array.isArray(order.tests) ? order.tests : []).forEach(({ item, qty, price, status }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "tests",
      image: item.paraClinic?.image,
      title: item.test?.name || "",
      subtitle: item.paraClinic?.name,
      price,
      qty,
      status,
    });
  });

  return rows;
};

const OrderConfirmationPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { user, isUserLoading } = useUser();

  const { data: order, error, mutate } = useSWR<OrderNode>(
    `${API}/user/order/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const push = useProgress();
  const { setPopup, closePopup } = usePopup();
  const notify = useNotification();
  const [cancelling, setCancelling] = useState(false);
  const cancelBusy = useRef(false);

  // Cancel before the seller prepares it (Digikala / Halodoc): only lines
  // still pending are cancelled, and each is refunded to the wallet.
  const cancelOrder = async () => {
    if (cancelBusy.current) return;
    cancelBusy.current = true;
    setCancelling(true);
    try {
      await fetcher({ url: `${API}/user/order/${nodeId}/cancel`, method: "POST" });
      closePopup("CancelOrder");
      notify(getContent("orderCancelledRefunded"), "Success");
      await mutate();
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      cancelBusy.current = false;
      setCancelling(false);
    }
  };

  if (!isUserLoading && !user) return <LoginRequired />;

  const rows = order ? buildRows(order) : [];
  const canCancel =
    order?.status === "paid" && rows.some((row) => row.status === "pending");
  // every line cancelled (by the buyer or the sellers): the order reads as
  // cancelled, not "paid"
  const shownStatus: OrderStatus | undefined =
    order && rows.length && rows.every((row) => row.status === "cancelled")
      ? "cancelled"
      : order?.status;

  const grouped = cartModels
    .map((model) => ({
      model,
      rows: rows.filter((row) => row.model === model),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <HandleLoading data={!!order} error={error}>
      {!!order && (
        <div className={classes.page}>
          <div className={classes.header}>
            <Ixon width="3.875rem" className={classes.icon}>
              <CheckCircleIcon />
            </Ixon>
            <legend className={`${classes.legend} ${tmdDemiBold}`}>
              {getContent("orderConfirmedTitle")}
            </legend>
            <div className={classes.orderNumber}>
              <span className={t2xsRegular}>{getContent("orderNumber")}</span>
              <span className={tsmRegular}>{order._id}</span>
            </div>
            <span className={`${classes.status} ${classes[shownStatus || order.status]}`}>
              {getContent(statusContent[shownStatus || order.status])}
            </span>
          </div>
          <div className={classes.sections}>
            <legend className={`${classes.title} ${tmdDemiBold}`}>
              {getContent("orderItems")}
            </legend>
            {grouped.map(({ model, rows: modelRows }) => (
              <div key={model} className={classes.section}>
                <legend className={`${classes.subtitle} ${tsmRegular}`}>
                  {getContent(sectionTitle[model])}
                </legend>
                <div className={classes.rows}>
                  {modelRows.map((row) => (
                    <div
                      key={`${row.model}-${row.itemId}`}
                      className={classes.row}
                    >
                      <div className={classes.imageBox}>
                        <HostedImage
                          alt={row.title}
                          src={row.image}
                          fill
                          sizes="4rem"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className={classes.info}>
                        <span className={`${classes.itemTitle} ${tsmRegular}`}>
                          {row.title}
                        </span>
                        {!!row.subtitle && (
                          <span
                            className={`${classes.itemSubtitle} ${t2xsRegular}`}
                          >
                            {row.subtitle}
                          </span>
                        )}
                        {!!row.status && (
                          <span className={classes.itemStatus}>
                            <OrderItemStatusBadge status={row.status} />
                          </span>
                        )}
                      </div>
                      <span className={`${classes.qty} ${t2xsRegular}`}>
                        {`x${row.qty}`}
                      </span>
                      <span className={`${classes.price} ${tsmRegular}`}>
                        {`${currencize(row.price * row.qty)} ${getContent("toman")}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!!order.shipments?.length && (
              <div className={classes.addressRow}>
                <span className={`${classes.subtitle} ${tsmRegular}`}>
                  {getContent("shippingMethod")}
                </span>
                {order.shipments.map((el) => (
                  <span key={el._id} className={t2xsRegular}>
                    {[
                      getContent(
                        el.method === "tapsi" ? "shippingTapsi" : "shippingTipax",
                      ),
                      typeof el.pharmacy === "object" ? el.pharmacy?.name : "",
                      el.payOnDelivery
                        ? getContent("shippingTipaxNote")
                        : el.fee > 0
                          ? `${currencize(el.fee)} ${getContent("toman")}`
                          : getContent("shippingFree"),
                      // sent by the pharmacy, with its tracking code
                      el.shippedAt
                        ? `${getContent("shipSent")}${el.trackingCode ? ` · ${getContent("shipTrackingCode")}: ${el.trackingCode}` : ""}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                ))}
              </div>
            )}
            {!!order.deliveryFee && (
              <div className={classes.totalRow}>
                <span className={tsmRegular}>{getContent("deliveryFee")}</span>
                <span className={tsmRegular}>
                  {`${currencize(order.deliveryFee)} ${getContent("toman")}`}
                </span>
              </div>
            )}
            <div className={classes.totalRow}>
              <span className={tsmRegular}>{getContent("totalPrice")}</span>
              <span className={`${classes.totalPrice} ${tlgBold}`}>
                {`${currencize(order.total)} ${getContent("toman")}`}
              </span>
            </div>
            {!!order.address && (
              <div className={classes.addressRow}>
                <span className={`${classes.subtitle} ${tsmRegular}`}>
                  {getContent("deliveryAddress")}
                </span>
                <span className={t2xsRegular}>
                  {`${order.address.displayName} - ${order.address.address}`}
                </span>
              </div>
            )}
          </div>
          {canCancel && (
            <Button
              variant="Error"
              mode="Outline"
              className={classes.action}
              isLoading={cancelling}
              onClick={() =>
                setPopup(
                  "CancelOrder",
                  <ConfirmationPopup
                    message={getContent("cancelOrderConfirm")}
                    isLoading={cancelling}
                    onConfirm={cancelOrder}
                  />,
                )
              }
            >
              {getContent("cancelOrder")}
            </Button>
          )}
          <Button onClick={() => push("/dashboard")} className={classes.action}>
            {getContent("dashboard")}
          </Button>
          <Button
            variant="Neutral"
            mode="Inline"
            onClick={() => push("/")}
            className={classes.action}
          >
            {getContent("backToHome")}
          </Button>
        </div>
      )}
    </HandleLoading>
  );
};

export default OrderConfirmationPage;
