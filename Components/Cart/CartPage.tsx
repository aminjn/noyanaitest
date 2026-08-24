"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./CartPage.module.css";
import useCart, { CartModel, cartModels, UseCartNode } from "../Hooks/useCart";
import useUser from "../Hooks/useUser";
import useLocale from "../Hooks/useLocale";
import HandleLoading from "../Admin/UI/HandleLoading";
import HostedImage from "../UI/HostedImage";
import { currencize } from "../helpers/currencize";
import Ixon from "../UI/Ixon";
import TrashIcon from "../Icons/TrashIcon";
import PlusIcon from "../Icons/PlusIcon";
import MinusIcon from "../Icons/MinusIcon";
import CartIcon from "../Icons/CartIcon";
import WalletIcon from "../Icons/WalletIcon";
import Button from "../UI/Button";
import Act from "../UI/Act";
import { ContentKey } from "../Enums/contentKeys";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useProgress from "../Hooks/useProgress";
import { IWallet } from "../Booking/Finalize/FinalizeBookingPage";
import {
  t2xsRegular,
  tlgBold,
  tmdDemiBold,
  tsmRegular,
  txsMedium,
} from "../UI/Typography";

// only "wallet" is wired up on the backend today (CartController.submitCart)
// - kept as a literal union (rather than importing orderPaymentMethods from
// the backend) so this file has no cross-project import
type OrderPaymentMethod = "wallet";

type SubmitCartResponse = { data: { _id: string } };

type CartRow = {
  itemId: string;
  model: CartModel;
  image?: string;
  title: string;
  subtitle?: string;
  price: number;
  discount?: number;
  qty: number;
};

const sectionTitle: Record<CartModel, ContentKey> = {
  products: "products",
  productPackages: "productPackages",
  services: "services",
  servicePackages: "servicePackages",
  tests: "tests",
};

const buildRows = (cart: UseCartNode): CartRow[] => {
  const rows: CartRow[] = [];

  cart.products.forEach(({ item, qty }) => {
    if (!item) return;
    rows.push({
      itemId: item._id,
      model: "products",
      image: item.product?.image,
      title: item.product?.name || "",
      subtitle: item.seller?.name,
      price: item.price || 0,
      discount: item.discount,
      qty,
    });
  });

  cart.productPackages.forEach(({ item, qty }) => {
    if (!item) return;
    rows.push({
      itemId: item._id,
      model: "productPackages",
      image: item.image,
      title: item.name || "",
      price: item.price || 0,
      discount: item.discount,
      qty,
    });
  });

  cart.services.forEach(({ item, qty }) => {
    if (!item) return;
    rows.push({
      itemId: item._id,
      model: "services",
      image: item.image,
      title: item.name || "",
      price: item.price || 0,
      discount: item.discount,
      qty,
    });
  });

  cart.servicePackages.forEach(({ item, qty }) => {
    if (!item) return;
    rows.push({
      itemId: item._id,
      model: "servicePackages",
      image: item.image,
      title: item.name || "",
      price: item.price || 0,
      discount: item.discount,
      qty,
    });
  });

  cart.tests.forEach(({ item, qty }) => {
    if (!item) return;
    rows.push({
      itemId: item._id,
      model: "tests",
      image: item.paraClinic?.image,
      title: item.test?.name || "",
      subtitle: item.paraClinic?.name,
      price: item.price || 0,
      qty,
    });
  });

  return rows;
};

const CartRowItem = ({
  row,
  isLoading,
  onChangeQty,
  onRemove,
}: {
  row: CartRow;
  isLoading: boolean;
  onChangeQty: (row: CartRow, amount: number) => void;
  onRemove: (row: CartRow) => void;
}) => {
  const getContent = useLocale();
  const finalPrice = (row.price || 0) - (row.discount || 0);

  return (
    <div className={classes.row}>
      <div className={classes.imageBox}>
        <HostedImage
          alt={row.title}
          src={row.image}
          fill
          sizes="4.5rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.info}>
        <span className={`${classes.itemTitle} ${tsmRegular}`}>
          {row.title}
        </span>
        {!!row.subtitle && (
          <span className={`${classes.itemSubtitle} ${t2xsRegular}`}>
            {row.subtitle}
          </span>
        )}
      </div>
      <div className={classes.priceBox}>
        {!!row.discount && (
          <s className={`${classes.strike} ${t2xsRegular}`}>
            {`${currencize(row.price)} ${getContent("toman")}`}
          </s>
        )}
        <span className={`${classes.price} ${tsmRegular}`}>
          {`${currencize(finalPrice)} ${getContent("toman")}`}
        </span>
      </div>
      <div className={classes.qtyBox}>
        <button
          type="button"
          className={classes.qtyBtn}
          disabled={isLoading}
          onClick={() => onChangeQty(row, 1)}
        >
          <Ixon width="1rem">
            <PlusIcon />
          </Ixon>
        </button>
        <span className={`${classes.qty} ${txsMedium}`}>{row.qty}</span>
        <button
          type="button"
          className={classes.qtyBtn}
          disabled={isLoading}
          onClick={() => onChangeQty(row, -1)}
        >
          <Ixon width="1rem">
            <MinusIcon />
          </Ixon>
        </button>
      </div>
      <button
        type="button"
        className={classes.removeBtn}
        disabled={isLoading}
        aria-label={getContent("remove")}
        onClick={() => onRemove(row)}
      >
        <Ixon width="1.125rem">
          <TrashIcon />
        </Ixon>
      </button>
    </div>
  );
};

const CheckoutSection = ({
  total,
  totalCount,
  isLoading,
  clearCart,
}: {
  total: number;
  totalCount: number;
  isLoading: boolean;
  clearCart: () => void;
}) => {
  const getContent = useLocale();
  const push = useProgress();

  const { data: wallet } = useSWR<IWallet>(`${API}/user/wallet`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const [method] = useState<OrderPaymentMethod>("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className={classes.summary}>
      <legend className={`${classes.summaryTitle} ${tmdDemiBold}`}>
        {getContent("totalPrice")}
      </legend>
      <div className={classes.summaryRow}>
        <span className={t2xsRegular}>{getContent("itemsCount")}</span>
        <span className={tsmRegular}>{totalCount}</span>
      </div>
      <div className={classes.summaryDivider} />
      <div className={classes.summaryRow}>
        <span className={t2xsRegular}>{getContent("totalPrice")}</span>
        <span className={`${classes.totalPrice} ${tlgBold}`}>
          {`${currencize(total)} ${getContent("toman")}`}
        </span>
      </div>
      <div className={classes.summaryDivider} />
      <div className={classes.summaryRow}>
        <span className={t2xsRegular}>{getContent("paymentMethod")}</span>
        <span className={tsmRegular}>{getContent("wallet")}</span>
      </div>
      {!!wallet && (
        <div className={classes.summaryRow}>
          <span className={`${classes.walletLabel} ${t2xsRegular}`}>
            <Ixon width="1rem">
              <WalletIcon />
            </Ixon>
            {getContent("balance")}
          </span>
          <span className={tsmRegular}>
            {`${currencize(wallet.balance)} ${getContent("toman")}`}
          </span>
        </div>
      )}
      <Button
        variant="Primary"
        mode="Fill"
        size="M"
        radius="Medium"
        isLoading={isSubmitting || isLoading}
        onClick={() => {
          if (isSubmitting || isLoading) return;
          setIsSubmitting(true);
        }}
      >
        {getContent("confirmAndPayOrder")}
      </Button>
      <Button
        variant="Error"
        mode="Outline"
        size="M"
        radius="Medium"
        isLoading={isLoading}
        onClick={() => clearCart()}
      >
        {getContent("removeAll")}
      </Button>
      <Act<SubmitCartResponse>
        path={isSubmitting ? `${API}/cart/submit` : null}
        method="POST"
        payload={{ method }}
        successMessage={getContent("orderSubmittedMessage")}
        onDone={(status, result) => {
          setIsSubmitting(false);
          if (status && result?.data?._id) push(`/order/${result.data._id}`);
        }}
      />
    </div>
  );
};

const CartPage = () => {
  const { user } = useUser();
  const {
    cart,
    mutateCartItem,
    removeCartItem,
    clearCart,
    isLoading,
    isCartLoading,
  } = useCart();

  const getContent = useLocale();

  if (!user)
    return (
      <div className={classes.noUser}>{getContent("loginToGainAccess")}</div>
    );

  const rows = cart ? buildRows(cart) : [];
  const isEmpty = !isCartLoading && rows.length === 0;

  const totalPrice = rows.reduce(
    (sum, row) => sum + ((row.price || 0) - (row.discount || 0)) * row.qty,
    0,
  );
  const totalCount = rows.reduce((sum, row) => sum + row.qty, 0);

  const grouped = cartModels
    .map((model) => ({
      model,
      rows: rows.filter((row) => row.model === model),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <HandleLoading data={!!cart}>
      <div className={classes.page}>
        <legend className={`${classes.pageTitle} ${tmdDemiBold}`}>
          {getContent("cart")}
        </legend>
        <div className={classes.layout}>
          <div className={classes.sections}>
            {isEmpty && (
              <div className={classes.empty}>
                <Ixon width="3rem" className={classes.emptyIcon}>
                  <CartIcon />
                </Ixon>
                <span className={`${classes.emptyTitle} ${tmdDemiBold}`}>
                  {getContent("cartIsEmpty")}
                </span>
                <span className={`${classes.emptyLegend} ${tsmRegular}`}>
                  {getContent("cartIsEmptyLegend")}
                </span>
              </div>
            )}
            {grouped.map(({ model, rows: modelRows }) => (
              <div key={model} className={classes.section}>
                <legend className={`${classes.title} ${tmdDemiBold}`}>
                  {getContent(sectionTitle[model])}
                </legend>
                <div className={classes.rows}>
                  {modelRows.map((row) => (
                    <CartRowItem
                      key={`${row.model}-${row.itemId}`}
                      row={row}
                      isLoading={isLoading}
                      onChangeQty={(target, amount) =>
                        mutateCartItem({
                          item: target.itemId,
                          model: target.model,
                          amount,
                        })
                      }
                      onRemove={(target) =>
                        removeCartItem({
                          item: target.itemId,
                          model: target.model,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {!isEmpty && (
            <CheckoutSection
              total={totalPrice}
              totalCount={totalCount}
              isLoading={isLoading}
              clearCart={clearCart}
            />
          )}
        </div>
      </div>
    </HandleLoading>
  );
};

export default CartPage;
