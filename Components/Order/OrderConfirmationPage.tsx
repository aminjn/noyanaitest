"use client";

import { OrderSamplings } from "../LabSampling/SamplingInfo";
import SamplingActions from "../LabSampling/SamplingActions";
import { ILabSampling, SamplingMoveInfo } from "../LabSampling/samplingTypes";
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
import AlertCircleIcon from "../Icons/AlertCircleIcon";
import ClockIcon from "../Icons/ClockIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import Badge from "../UI/Badge";
import { mutate as globalMutate } from "swr";
import { useIntlLocale } from "../i18n/navigation";
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
import { IOrderLinePrescription, RxPrescriptionDetails } from "./RxPrescription";
import {
  IOrderLineResponse,
  OrderItemStatus,
  pendingResponseDeadline,
} from "../Dashboard/Order/orderItemStatus";
import OrderLineDeadline from "../Dashboard/Order/OrderLineDeadline";
import OrderShipments from "./OrderShipments";
import { IOrderShipment, lineShippingOf } from "./orderShipment";
import usePopup from "../Hooks/usePopup";
import useNotification from "../Hooks/useNotification";
import ConfirmationPopup from "../Admin/UI/ConfirmationPopup";
import { useRef, useState } from "react";
import SubmitCommentForm from "../Comment/SubmitCommentForm";
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
  products: ({
    item: T["Products"] extends ProductSellerPopulation
      ? IProductSeller<T["Products"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
    // prescription-only line and the prescription given (2026-10)
    requiresPrescription?: boolean;
    prescription?: IOrderLinePrescription;
  } & IOrderLineResponse)[];
  productPackages: ({
    item: T["ProductPackages"] extends ProductPackagePopulation
      ? IProductPackage<T["ProductPackages"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
    requiresPrescription?: boolean;
    prescription?: IOrderLinePrescription;
  } & IOrderLineResponse)[];
  services: ({
    item: T["Services"] extends ServicePopulation
      ? IService<T["Services"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  } & Pick<IOrderLineResponse, "autoCancel">)[];
  servicePackages: ({
    item: T["ServicePackages"] extends ServicePackagePopulation
      ? IServicePackage<T["ServicePackages"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
  } & Pick<IOrderLineResponse, "autoCancel">)[];
  tests: ({
    item: T["Tests"] extends ParaClinicTestPopulation
      ? IParaClinicTest<T["Tests"]>
      : string;
    qty: number;
    price: number;
    // per-line fulfillment, set by the seller (Models/Order.ts)
    status?: OrderItemStatus;
    // the lab's answer: private result files and a note (2026-10)
    result?: { files?: string[]; note?: string };
    // its sampling appointment (2026-10, backend Lib/labSampling.ts)
    sampling?: ILabSampling | string | null;
  } & IOrderLineResponse)[];
  total: number;
  // one per pharmacy (backend Lib/delivery.ts); Tapsi's fee is in `total`
  shipments?: IOrderShipment[];
  deliveryFee?: number;
  // home-sampling fees, in `total`
  samplingFee?: number;
  // the checkout's discounts and supplementary insurance (2026-10, backend
  // Lib/cartOffers.ts): already taken off `total`
  clubDiscount?: number;
  promoDiscount?: number;
  insurerShare?: number;
  insurance?: { name?: string; insurerShare?: number; reimburse?: boolean };
  // the discount code (backend Models/Order.ts promo)
  promo?: { code?: string; title?: string; fundedBy?: "platform" | "seller"; amount?: number };
  // what the buyer may do with each sampling appointment, by its id
  // (2026-10, backend Lib/labSamplingReschedule.ts)
  samplingMoves?: Record<string, SamplingMoveInfo>;
  // the wallet, sent when a lab's open proposal charges a home fee (the
  // top-up offer before accepting)
  walletBalance?: number;
  paymentMethod: "wallet" | "sep";
  // what went back to the wallet for this order (backend getMyOrder, the
  // buyer's own refund rows in the ledger)
  refunded?: number;
  status: OrderStatus;
  address?: IUserAddress;
  submittedAt: string;
  paidAt?: string;
  // the pharmacies / labs with a fulfilled line here, each rated once for
  // this order (2026-10, backend userController.getMyOrder)
  reviewSellers?: {
    refPath: "Pharmacy" | "ParaClinic";
    _id: string;
    name?: string;
    slug?: string;
    image?: string;
  }[];
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
  result?: { files?: string[]; note?: string };
  prescription?: IOrderLinePrescription;
  // seller response deadline / auto-cancel (pharmacy and lab lines)
  respondBy?: string | null;
  acceptedAt?: string;
  autoCancel?: IOrderLineResponse["autoCancel"];
  collected?: boolean;
  // the pharmacy a product / package line ships from (its parcel's state)
  pharmacyId?: string;
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

// the deadline still running (pending, unanswered) and the line's outcome
const responseOf = (line: { status?: OrderItemStatus } & IOrderLineResponse) => ({
  respondBy: pendingResponseDeadline(line),
  acceptedAt: line.acceptedAt,
  autoCancel: line.autoCancel,
});

// a populated ref or a bare id
const refId = (value: unknown): string | undefined =>
  value && typeof value === "object"
    ? String((value as { _id?: unknown })._id ?? "") || undefined
    : value
      ? String(value)
      : undefined;

const buildRows = (order: OrderNode): OrderRow[] => {
  const rows: OrderRow[] = [];

  (Array.isArray(order.products) ? order.products : []).forEach((line) => {
    const { item, qty, price, status, requiresPrescription, prescription } = line;
    if (!item || typeof item === "string") return;
    rows.push({
      ...responseOf(line),
      itemId: item._id,
      model: "products",
      image: item.product?.image,
      title: item.product?.name || "",
      subtitle: item.seller?.name,
      pharmacyId: refId((item as { seller?: unknown }).seller),
      price,
      qty,
      status,
      prescription: requiresPrescription ? prescription : undefined,
    });
  });

  (Array.isArray(order.productPackages) ? order.productPackages : []).forEach((line) => {
    const { item, qty, price, status, requiresPrescription, prescription } = line;
    if (!item || typeof item === "string") return;
    rows.push({
      ...responseOf(line),
      itemId: item._id,
      model: "productPackages",
      image: item.image,
      title: item.name || "",
      pharmacyId: refId((item as { owner?: unknown }).owner),
      price,
      qty,
      status,
      prescription: requiresPrescription ? prescription : undefined,
    });
  });

  (Array.isArray(order.services) ? order.services : []).forEach(({ item, qty, price, status, autoCancel }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      autoCancel,
      itemId: item._id,
      model: "services",
      image: item.image,
      title: item.name || "",
      price,
      qty,
      status,
    });
  });

  (Array.isArray(order.servicePackages) ? order.servicePackages : []).forEach(({ item, qty, price, status, autoCancel }) => {
    if (!item || typeof item === "string") return;
    rows.push({
      autoCancel,
      itemId: item._id,
      model: "servicePackages",
      image: item.image,
      title: item.name || "",
      price,
      qty,
      status,
    });
  });

  (Array.isArray(order.tests) ? order.tests : []).forEach((line) => {
    const { item, qty, price, status, result, sampling } = line;
    if (!item || typeof item === "string") return;
    rows.push({
      ...responseOf(line),
      // its sample was taken: it stays with the lab (no buyer cancel)
      collected: !!sampling && typeof sampling === "object" && !!sampling.collectedAt,
      itemId: item._id,
      model: "tests",
      image: item.paraClinic?.image,
      title: item.test?.name || "",
      subtitle: item.paraClinic?.name,
      price,
      qty,
      status,
      result,
    });
  });

  return rows;
};

// the lab and the tests of one sampling appointment of the order
const samplingLines = (order: OrderNode, samplingId: string) =>
  (Array.isArray(order.tests) ? order.tests : []).filter((l) => {
    const s = l?.sampling;
    return !!s && (typeof s === "string" ? s : s._id) === samplingId;
  });
const labNameOf = (order: OrderNode, samplingId: string) => {
  const item = samplingLines(order, samplingId)[0]?.item;
  return item && typeof item === "object" && item.paraClinic && typeof item.paraClinic === "object"
    ? item.paraClinic.name
    : undefined;
};
const testNamesOf = (order: OrderNode, samplingId: string) =>
  samplingLines(order, samplingId)
    .map((l) => (l.item && typeof l.item === "object" && l.item.test && typeof l.item.test === "object" ? l.item.test.name : ""))
    .filter((name): name is string => !!name);

// (2026-10, backend Lib/orderPromoRecheck.ts) a partial cancel that left
// the rest of the order short of its discount code: what was kept back
// from the refunds, and why
type PromoClawbackReason = "minOrder" | "noEligible" | "recomputed";
const clawbackKey: Record<PromoClawbackReason, ContentKey> = {
  minOrder: "promoClawbackMinOrder",
  noEligible: "promoClawbackNoEligible",
  recomputed: "promoClawbackRecomputed",
};
const promoClawbackOf = (order?: OrderNode | null) => {
  let amount = 0;
  let reason: PromoClawbackReason | null = null;
  for (const model of ["products", "productPackages", "services", "servicePackages", "tests"] as const) {
    const lines = order && Array.isArray(order[model]) ? (order[model] as unknown[]) : [];
    for (const raw of lines) {
      const l = (raw || {}) as { promoClawback?: unknown; promoClawbackReason?: unknown };
      const v = typeof l.promoClawback === "number" && l.promoClawback > 0 ? l.promoClawback : 0;
      if (!v) continue;
      amount += v;
      if (!reason && typeof l.promoClawbackReason === "string" && l.promoClawbackReason in clawbackKey)
        reason = l.promoClawbackReason as PromoClawbackReason;
    }
  }
  return { amount, reason: reason || ("recomputed" as PromoClawbackReason) };
};

type CancelPreview = { refund?: number; clawback?: number; reason?: PromoClawbackReason | null; total?: number; partial?: boolean; promoTitle?: string };

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
  const intlTag = useIntlLocale();
  const num = new Intl.NumberFormat(intlTag);

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

  // «خرید دوباره» (Digikala / Halodoc / Snapp Pharmacy): the order's lines
  // back into the cart at today's price, then the cart
  const [reordering, setReordering] = useState(false);
  const reorder = async () => {
    if (reordering || !order) return;
    setReordering(true);
    try {
      const res = (await fetcher({
        url: `${API}/cart/reorder`,
        method: "POST",
        bodyParser: "JSON",
        payload: { order: order._id },
      })) as { data?: { added?: number; skipped?: number } };
      const added = Number(res?.data?.added) || 0;
      const skipped = Number(res?.data?.skipped) || 0;
      globalMutate(`${API}/cart`);
      globalMutate(`${API}/cart/size`);
      if (!added) {
        notify(getContent(skipped ? "reorderNothing" : "reorderAlreadyInCart"), skipped ? "Warn" : "Success");
        if (!skipped) push("/cart");
        return;
      }
      notify(
        [getContent("reorderDone", [num.format(added)]), skipped ? getContent("reorderSkipped", [num.format(skipped)]) : ""]
          .filter(Boolean)
          .join(" "),
        skipped ? "Warn" : "Success",
      );
      push("/cart");
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setReordering(false);
    }
  };

  if (!isUserLoading && !user) return <LoginRequired />;

  const rows = order ? buildRows(order) : [];
  // what the buyer may still cancel: a pending line whose parcel has not
  // left the pharmacy (backend userController.cancelMyOrder) and whose
  // sample has not been taken
  const shippedPharmacies = new Set(
    (Array.isArray(order?.shipments) ? order!.shipments! : [])
      .filter((s) => !!s?.shippedAt)
      .map((s) => String(s.pharmacy && typeof s.pharmacy === "object" ? s.pharmacy._id : s.pharmacy || "")),
  );
  const canCancel =
    order?.status === "paid" &&
    rows.some(
      (row) => row.status === "pending" && !row.collected && !(row.pharmacyId && shippedPharmacies.has(row.pharmacyId)),
    );
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
  // the hero follows the order: placed, waiting for the bank, or cancelled
  // (it used to say "your order was placed" with a green tick in every case)
  const heroStatus: OrderStatus = shownStatus || order?.status || "paid";
  const heroTitle: ContentKey =
    heroStatus === "cancelled"
      ? "orderCancelledTitle"
      : heroStatus === "pending"
        ? "orderAwaitingPaymentTitle"
        : "orderConfirmedTitle";
  // pharmacies none of whose lines go ahead: their parcel will never ship
  const closedPharmacies = Array.from(
    new Set(rows.map((row) => row.pharmacyId).filter((id): id is string => !!id)),
  ).filter((id) => rows.filter((row) => row.pharmacyId === id).every((row) => row.status === "cancelled"));
  // a paid order with something still to buy again (not only services)
  const canReorder = !!order && order.status !== "pending" && rows.some((row) => row.model !== "services" && row.model !== "servicePackages");

  return (
    <HandleLoading data={!!order} error={error}>
      {!!order && (
        <div className={classes.page}>
          <div className={classes.header}>
            <Ixon
              width="3.875rem"
              className={`${classes.icon} ${heroStatus !== "paid" ? classes[`icon_${heroStatus}`] : ""}`}
            >
              {heroStatus === "cancelled" ? <AlertCircleIcon /> : heroStatus === "pending" ? <ClockIcon /> : <CheckCircleIcon />}
            </Ixon>
            <legend className={`${classes.legend} ${heroStatus !== "paid" ? classes[`legend_${heroStatus}`] : ""} ${tmdDemiBold}`}>
              {getContent(heroTitle)}
            </legend>
            <div className={classes.orderNumber}>
              <span className={t2xsRegular}>{getContent("orderNumber")}</span>
              {/* a short, readable reference (the last 8 of the id), the way
                  support asks for it; Latin and left-to-right in every language */}
              <bdi dir="ltr" className={`${classes.orderCode} ${tsmRegular}`} title={order._id}>
                {`#${String(order._id).slice(-8).toUpperCase()}`}
              </bdi>
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
                        {/* a lab line whose result is uploaded reads "result
                            ready" (Halodoc), not "accepted, in progress" */}
                        {row.model === "tests" && row.status === "pending" && !!row.result?.files?.length ? (
                          <span className={classes.itemStatus}>
                            <Badge color="Success" mode="Outline">
                              {getContent("copResultReady")}
                            </Badge>
                          </span>
                        ) : !!row.status && (
                          <span className={classes.itemStatus}>
                            <OrderItemStatusBadge
                              status={row.status}
                              acceptedAt={row.acceptedAt}
                              autoCancel={row.autoCancel}
                              shipping={lineShippingOf(order.shipments, row.pharmacyId)}
                            />
                          </span>
                        )}
                        <OrderLineDeadline respondBy={row.respondBy} audience="buyer" />
                        {!!row.prescription && (
                          <RxPrescriptionDetails prescription={row.prescription} />
                        )}
                        {(!!row.result?.files?.length || !!row.result?.note) && (
                          <div className={classes.result}>
                            <span className={`${classes.itemSubtitle} ${t2xsRegular}`}>
                              {getContent("labResult")}
                              {row.result?.note ? `: ${row.result.note}` : ""}
                            </span>
                            {/* each file as a finger-sized button that opens
                                (and on a phone, saves) the private result */}
                            <div className={classes.resultFiles}>
                              {(row.result?.files || []).filter(Boolean).map((id, i) => (
                                <a
                                  key={id}
                                  className={`${classes.resultFile} ${t2xsRegular}`}
                                  href={`${API}/notpublic/${id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                >
                                  <Ixon width="1rem">
                                    <DownloadIcon />
                                  </Ixon>
                                  {getContent("labResultFile", [num.format(i + 1)])}
                                </a>
                              ))}
                            </div>
                          </div>
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
            {/* lab sampling appointments, once per lab (2026-10) */}
            <OrderSamplings
              lines={order.tests as never}
              viewer="buyer"
              renderActions={(sampling) => (
                <SamplingActions
                  sampling={sampling}
                  info={order.samplingMoves?.[sampling._id]}
                  viewer="buyer"
                  labName={labNameOf(order, sampling._id)}
                  tests={testNamesOf(order, sampling._id)}
                  onMove={async (payload) => {
                    await fetcher({
                      url: `${API}/user/order/${nodeId}/sampling/${sampling._id}/reschedule`,
                      method: "POST",
                      payload,
                      bodyParser: "JSON",
                    });
                    await mutate();
                  }}
                  onCancel={async () => {
                    await fetcher({
                      url: `${API}/user/order/${nodeId}/sampling/${sampling._id}/cancel`,
                      method: "POST",
                    });
                    await mutate();
                  }}
                  walletBalance={order.walletBalance}
                  onAnswerProposal={async (answer, address) => {
                    await fetcher({
                      url: `${API}/user/order/${nodeId}/sampling/${sampling._id}/proposal`,
                      method: "POST",
                      payload: {
                        proposal: order.samplingMoves?.[sampling._id]?.proposal?._id,
                        answer,
                        ...(address ? { address } : {}),
                      },
                      bodyParser: "JSON",
                    });
                    await mutate();
                  }}
                />
              )}
            />
            {!!order.shipments?.length && (
              <div className={classes.addressRow}>
                <OrderShipments
                  orderId={order._id}
                  shipments={order.shipments}
                  closedPharmacies={closedPharmacies}
                  canAct={order.status === "paid"}
                  onChange={() => mutate()}
                />
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
            {!!order.samplingFee && (
              <div className={classes.totalRow}>
                <span className={tsmRegular}>{getContent("lsHomeFee")}</span>
                <span className={tsmRegular}>
                  {`${currencize(order.samplingFee)} ${getContent("toman")}`}
                </span>
              </div>
            )}
            {/* (2026-10) the discounts and the insurer's share of the order */}
            {(
              [
                ["clubDiscountRow", order.clubDiscount],
                ["promoDiscountRow", order.promoDiscount],
                ["insurerShareRow", order.insurerShare],
              ] as const
            )
              .filter(([, amount]) => Number(amount) > 0)
              .map(([key, amount]) => (
                <div key={key} className={classes.totalRow}>
                  <span className={tsmRegular}>{getContent(key)}</span>
                  <span className={tsmRegular}>
                    {`− ${currencize(Number(amount))} ${getContent("toman")}`}
                  </span>
                </div>
              ))}
            <div className={classes.totalRow}>
              <span className={tsmRegular}>{getContent("totalPrice")}</span>
              <span className={`${classes.totalPrice} ${tlgBold}`}>
                {`${currencize(order.total)} ${getContent("toman")}`}
              </span>
            </div>
            {!!order.insurance?.reimburse && !!order.insurance.name && (
              <div className={classes.addressRow}>
                <span className={t2xsRegular}>
                  {getContent("orderInsuranceReimburseNote", [order.insurance.name])}
                </span>
              </div>
            )}
            {Number(order.refunded) > 0 && (
              <div className={classes.totalRow}>
                <span className={tsmRegular}>{getContent("orderRefundedToWallet")}</span>
                <span className={tsmRegular}>
                  {`${currencize(Number(order.refunded))} ${getContent("toman")}`}
                </span>
              </div>
            )}
            {(() => {
              const claw = promoClawbackOf(order);
              if (!claw.amount) return null;
              return (
                <div className={classes.addressRow}>
                  <span className={t2xsRegular}>
                    {getContent(clawbackKey[claw.reason], [
                      order.promo?.code || order.promo?.title || "",
                      currencize(claw.amount),
                    ])}
                  </span>
                </div>
              );
            })()}
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
          {/* "rate your order" (2026-10, Digikala / Snappfood): one verified
              review per delivered seller of this order */}
          {(() => {
            const sellers = (Array.isArray(order.reviewSellers) ? order.reviewSellers : []).filter(
              (el) => !!el?._id && (el.refPath === "Pharmacy" || el.refPath === "ParaClinic"),
            );
            if (!sellers.length) return null;
            return (
              <div className={classes.sections} id="review">
                <legend className={`${classes.title} ${tmdDemiBold}`}>
                  {getContent("rateYourOrderTitle")}
                </legend>
                <span className={`${classes.subtitle} ${t2xsRegular}`}>
                  {getContent("rateYourOrderHint")}
                </span>
                {sellers.map((el) => (
                  <SubmitCommentForm
                    key={`${el.refPath}-${el._id}`}
                    model={el.refPath}
                    nodeId={el._id}
                    order={order._id}
                    title={el.name || undefined}
                  />
                ))}
              </div>
            );
          })()}
          {canCancel && (
            <Button
              variant="Error"
              mode="Outline"
              className={classes.action}
              isLoading={cancelling}
              onClick={async () => {
                // (2026-10) the confirmation says what comes back, and what
                // of a discount code is kept back when the rest of the order
                // no longer earns it (GET /user/order/:id/cancel)
                let preview: CancelPreview | null = null;
                try {
                  const res = (await fetcher({ url: `${API}/user/order/${nodeId}/cancel` })) as { data?: CancelPreview };
                  preview = res?.data && typeof res.data === "object" ? res.data : null;
                } catch {
                  preview = null;
                }
                const lines = [getContent("cancelOrderConfirm")];
                if (preview && Number(preview.total) > 0)
                  lines.push(getContent("cancelPreviewRefund", [currencize(Number(preview.total))]));
                if (preview && Number(preview.clawback) > 0) {
                  const reason = preview.reason && preview.reason in clawbackKey ? preview.reason : "recomputed";
                  lines.push(
                    getContent(clawbackKey[reason], [
                      preview.promoTitle || order.promo?.code || "",
                      currencize(Number(preview.clawback)),
                    ]),
                  );
                }
                setPopup(
                  "CancelOrder",
                  <ConfirmationPopup message={lines.join(" ")} isLoading={cancelling} onConfirm={cancelOrder} />,
                );
              }}
            >
              {getContent("cancelOrder")}
            </Button>
          )}
          {canReorder && (
            <Button variant="Primary" mode="Outline" className={classes.action} isLoading={reordering} onClick={reorder}>
              {getContent("reorder")}
            </Button>
          )}
          <Button onClick={() => push("/dashboard/order")} className={classes.action}>
            {getContent("orders")}
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
