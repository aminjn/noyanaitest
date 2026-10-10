"use client";

import useSWR from "swr";
import classes from "./CartPage.module.css";
import useCart, { CartModel, cartModels, UseCartNode } from "../Hooks/useCart";
import useUser from "../Hooks/useUser";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import HandleLoading from "../Admin/UI/HandleLoading";
import LoginRequired from "../UI/LoginRequired";
import HostedImage from "../UI/HostedImage";
import { currencize } from "../helpers/currencize";
import Ixon from "../UI/Ixon";
import TrashIcon from "../Icons/TrashIcon";
import PlusIcon from "../Icons/PlusIcon";
import MinusIcon from "../Icons/MinusIcon";
import CartIcon from "../Icons/CartIcon";
import WalletIcon from "../Icons/WalletIcon";
import Button from "../UI/Button";
import { ContentKey } from "../Enums/contentKeys";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import usePopup from "../Hooks/usePopup";
import { IWallet } from "../Booking/Finalize/FinalizeBookingPage";
import CartCheckoutPopup from "./CartCheckoutPopup";
import {
  t2xsRegular,
  tlgBold,
  tmdDemiBold,
  tsmRegular,
  txsMedium,
} from "../UI/Typography";
import CartItemActions from "./CartItemActions";
import RxBadge from "../Product/RxBadge";
import ConfirmationPopup from "../Admin/UI/ConfirmationPopup";
import { mutate as globalMutate } from "swr";
import useNotification from "../Hooks/useNotification";

const NS: ContentNamespace[] = ["common", "cartPage"];

// physical goods that need to be shipped - kept in sync with
// physicalCartModels in CartController.submitCart on noyanai-back
const physicalCartModels: CartModel[] = ["products", "productPackages"];

export type CartRow = {
  itemId: string;
  model: CartModel;
  image?: string;
  title: string;
  subtitle?: string;
  price: number;
  discount?: number;
  qty: number;
  // prescription-only (2026-10): checkout asks for a prescription
  requiresPrescription?: boolean;
  // can't be bought right now (backend cartController.getMyCart issues)
  issue?: CartLineIssue;
};

export type CartLineIssue = "unavailable" | "outOfStock" | "badQty";

const sectionTitle: Record<CartModel, ContentKey> = {
  products: "products",
  productPackages: "productPackages",
  services: "services",
  servicePackages: "servicePackages",
  tests: "tests",
};

export const buildCartRows = (cart: UseCartNode): CartRow[] => {
  const rows: CartRow[] = [];
  const issues = new Map(
    (Array.isArray((cart as { issues?: unknown }).issues)
      ? ((cart as unknown as { issues: { model?: string; item?: string; issue?: CartLineIssue }[] }).issues)
      : []
    ).map((el) => [`${el?.model}:${el?.item}`, el?.issue]),
  );

  (Array.isArray(cart.products) ? cart.products : []).forEach(({ item, qty }) => {
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
      requiresPrescription: !!item.product?.requiresPrescription,
    });
  });

  (Array.isArray(cart.productPackages) ? cart.productPackages : []).forEach(({ item, qty }) => {
    if (!item) return;
    rows.push({
      itemId: item._id,
      model: "productPackages",
      image: item.image,
      title: item.name || "",
      price: item.price || 0,
      discount: item.discount,
      qty,
      requiresPrescription: !!item.requiresPrescription,
    });
  });

  (Array.isArray(cart.services) ? cart.services : []).forEach(({ item, qty }) => {
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

  (Array.isArray(cart.servicePackages) ? cart.servicePackages : []).forEach(({ item, qty }) => {
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

  (Array.isArray(cart.tests) ? cart.tests : []).forEach(({ item, qty }) => {
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

  return rows.map((row) => ({ ...row, issue: issues.get(`${row.model}:${row.itemId}`) || undefined }));
};

const CartRowItem = ({
  row,
  isLoading,
  onRemove,
}: {
  row: CartRow;
  isLoading: boolean;
  onRemove: (row: CartRow) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const finalPrice = (row.price || 0) - (row.discount || 0);

  return (
    <div className={`${classes.row} ${row.issue ? classes.rowIssue : ""}`}>
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
        {!!row.requiresPrescription && <RxBadge className={classes.rx} />}
        {!!row.issue && (
          <span className={`${classes.issue} ${t2xsRegular}`}>
            {getContent(row.issue === "outOfStock" ? "outOfStock" : "cartLineUnavailable")}
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
      <CartItemActions row={row} />
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
  requiresAddress,
  issueRows,
  onRemoveIssues,
}: {
  total: number;
  totalCount: number;
  isLoading: boolean;
  clearCart: () => void;
  requiresAddress: boolean;
  // lines that can't be bought now: checkout waits until they are removed
  issueRows: CartRow[];
  onRemoveIssues: () => void;
}) => {
  const getContent = useScopedLocale(NS);

  const { setPopup, closePopup } = usePopup();
  const pushNotification = useNotification();

  const { data: wallet } = useSWR<IWallet>(
    `${API}/user/wallet`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

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
      {!!issueRows.length && (
        <div className={classes.issueBox} role="alert">
          <span className={t2xsRegular}>{getContent("cartHasIssues")}</span>
          <Button
            variant="Error"
            mode="Outline"
            size="S"
            radius="Medium"
            isLoading={isLoading}
            onClick={onRemoveIssues}
          >
            {getContent("cartRemoveIssues")}
          </Button>
        </div>
      )}
      <Button
        variant="Primary"
        mode="Fill"
        size="M"
        radius="Medium"
        isLoading={isLoading}
        onClick={() => {
          if (isLoading) return;
          if (issueRows.length) {
            pushNotification(getContent("cartHasIssues"), "Warn");
            return;
          }
          setPopup(
            "CartCheckout",
            <CartCheckoutPopup
              total={total}
              requiresAddress={requiresAddress}
            />,
          );
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
        onClick={() =>
          setPopup(
            "ClearCart",
            <ConfirmationPopup
              message={getContent("clearCartConfirm")}
              onConfirm={() => {
                clearCart();
                closePopup("ClearCart");
              }}
            />,
          )
        }
      >
        {getContent("removeAll")}
      </Button>
    </div>
  );
};

const CartPage = () => {
  const { user } = useUser();
  const {
    cart,
    removeCartItem,
    refreshCart: mutateCart,
    clearCart,
    isLoading,
    isCartLoading,
  } = useCart();

  const getContent = useScopedLocale(NS);

  if (!user) return <LoginRequired />;

  const rows = cart ? buildCartRows(cart) : [];
  const isEmpty = !isCartLoading && rows.length === 0;

  // what can be bought: an unavailable line is shown but not counted
  const buyable = rows.filter((row) => !row.issue);
  const totalPrice = buyable.reduce(
    (sum, row) => sum + ((row.price || 0) - (row.discount || 0)) * row.qty,
    0,
  );
  const totalCount = buyable.reduce((sum, row) => sum + row.qty, 0);

  const requiresAddress = rows.some((row) =>
    physicalCartModels.includes(row.model),
  );

  const issueRows = rows.filter((row) => !!row.issue);

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
        <div className={`${classes.layout} ${isEmpty ? classes.single : ""}`}>
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
              requiresAddress={requiresAddress}
              issueRows={issueRows}
              onRemoveIssues={async () => {
                for (const row of issueRows)
                  await fetcher({ url: `${API}/cart/item`, method: "PUT", payload: { item: row.itemId, model: row.model } }).catch(() => null);
                mutateCart();
                globalMutate(`${API}/cart/size`);
              }}
            />
          )}
        </div>
      </div>
    </HandleLoading>
  );
};

export default CartPage;
