"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import classes from "./OrderConfirmationPage.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import useLocale from "../Hooks/useLocale";
import useProgress from "../Hooks/useProgress";
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
import {
  t2xsRegular,
  tlgBold,
  tmdDemiBold,
  tsmRegular,
} from "../UI/Typography";

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
  }[];
  productPackages: {
    item: T["ProductPackages"] extends ProductPackagePopulation
      ? IProductPackage<T["ProductPackages"]>
      : string;
    qty: number;
    price: number;
  }[];
  services: {
    item: T["Services"] extends ServicePopulation
      ? IService<T["Services"]>
      : string;
    qty: number;
    price: number;
  }[];
  servicePackages: {
    item: T["ServicePackages"] extends ServicePackagePopulation
      ? IServicePackage<T["ServicePackages"]>
      : string;
    qty: number;
    price: number;
  }[];
  tests: {
    item: T["Tests"] extends ParaClinicTestPopulation
      ? IParaClinicTest<T["Tests"]>
      : string;
    qty: number;
    price: number;
  }[];
  total: number;
  paymentMethod: "wallet";
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

  order.products.forEach(({ item, qty, price }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "products",
      image: item.product?.image,
      title: item.product?.name || "",
      subtitle: item.seller?.name,
      price,
      qty,
    });
  });

  order.productPackages.forEach(({ item, qty, price }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "productPackages",
      image: item.image,
      title: item.name || "",
      price,
      qty,
    });
  });

  order.services.forEach(({ item, qty, price }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "services",
      image: item.image,
      title: item.name || "",
      price,
      qty,
    });
  });

  order.servicePackages.forEach(({ item, qty, price }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "servicePackages",
      image: item.image,
      title: item.name || "",
      price,
      qty,
    });
  });

  order.tests.forEach(({ item, qty, price }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      itemId: item._id,
      model: "tests",
      image: item.paraClinic?.image,
      title: item.test?.name || "",
      subtitle: item.paraClinic?.name,
      price,
      qty,
    });
  });

  return rows;
};

const OrderConfirmationPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();

  const { data: order, error } = useSWR<OrderNode>(
    `${API}/user/order/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const push = useProgress();

  const rows = order ? buildRows(order) : [];

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
            <span className={`${classes.status} ${classes[order.status]}`}>
              {getContent(statusContent[order.status])}
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
