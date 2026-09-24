import { useEffect, useMemo, useRef } from "react";
import useCart from "../Hooks/useCart";
import useProgress from "../Hooks/useProgress";
import classes from "./CartModal.module.css";
import { buildCartRows, CartRow } from "../Cart/CartPage";
import HostedImage from "../UI/HostedImage";
import CartItemActions from "../Cart/CartItemActions";
import Button from "../UI/Button";
import { currencize } from "../helpers/currencize";
import {
  t2xsDemiBold,
  tbaseBold,
  tmdBold,
  tsmRegular,
  txsRegular,
} from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const CartModal = ({ close }: { close: () => unknown }) => {
  const push = useProgress();

  const { cart, mutateCartItem, removeCartItem } = useCart();

  const rows = useMemo<CartRow[]>(
    () => (cart ? buildCartRows(cart) : []),
    [cart],
  );

  const totalPrice = useMemo<number>(
    () => rows.reduce((acc, el) => acc + el.price * el.qty, 0),
    [rows],
  );

  const totalDiscount = useMemo<number>(
    () => rows.reduce((acc, el) => acc + (el.discount || 0) * el.qty, 0),
    [rows],
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      ) {
        return close();
      }
    };
    setTimeout(() => {
      window.addEventListener("click", listener, false);
    }, 10);
    return () => window.removeEventListener("click", listener, false);
  }, [close]);

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <div className={classes.main} ref={containerRef}>
      <div className={classes.header}>
        <span className={`${classes.title} ${tbaseBold}`}>
          {getContent("myCart")}
        </span>
        <span className={`${classes.count} ${txsRegular}`}>
          ({rows.length})
        </span>
      </div>
      <div className={classes.rows}>
        {rows.map((row) => (
          <div className={classes.row} key={row.itemId}>
            <div className={classes.image}>
              <HostedImage
                src={row.image}
                alt={row.title}
                fill
                sizes="5rem"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={classes.itemContent}>
              <span className={`${classes.itemName} ${tsmRegular}`}>
                {row.title}
              </span>
              <div className={classes.rowFooter}>
                <CartItemActions row={row} />
                <div className={classes.priceBox}>
                  {!!row.discount && (
                    <span className={`${classes.percent} ${t2xsDemiBold}`}>
                      {getContent("percentSymbol", [
                        Math.ceil((row.discount / row.price) * 100).toString(),
                      ])}
                    </span>
                  )}
                  {!!row.discount && (
                    <s className={`${classes.discount} ${txsRegular}`}>
                      {getContent("xToman", [
                        currencize(row.discount * row.qty),
                      ])}
                    </s>
                  )}
                  <span className={`${classes.price} ${tmdBold}`}>
                    {getContent("xToman", [currencize(row.price * row.qty)])}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={classes.footer}>
        <Button
          href={"/cart"}
          onClick={() => close()}
          variant="Error"
          radius="Medium"
          size="L"
          mode="Fill"
        >
          {getContent("submitOrder")}
        </Button>
        <div className={classes.totalBox}>
          {!!totalDiscount && (
            <div className={classes.discountBox}>
              <s className={`${classes.discount} ${txsRegular}`}>
                {getContent("xToman", [currencize(totalDiscount)])}
              </s>
              <span className={`${classes.percent} ${t2xsDemiBold}`}>
                {getContent("percentSymbol", [
                  Math.ceil((totalDiscount / totalPrice) * 100).toString(),
                ])}
              </span>
            </div>
          )}
          <div className={`${classes.price} ${tmdBold}`}>
            {getContent("xToman", [currencize(totalPrice)])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
