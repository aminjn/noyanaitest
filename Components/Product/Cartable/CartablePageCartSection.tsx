import useCart, { CartModel, UseCartNode } from "@/Components/Hooks/useCart";
import classes from "./CartablePageCartSection.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import { Fragment, ReactNode } from "react";
import {
  t2xsRegular,
  tlgBold,
  tmdDemiBold,
  tsmRegular,
} from "@/Components/UI/Typography";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { currencize } from "@/Components/helpers/currencize";
import CartActions from "../CartActions";
import ProductCartInfos from "../ProductCartInfos";
import PlusBox from "../PlusBox";
const CartablePageCartSection = ({
  cartTitle,
  cartTitleTail,
  owner,
  discount,
  price,
  itemId,
  model,
}: {
  cartTitle: ContentKey;
  cartTitleTail?: ReactNode;
  owner?: ReactNode;
  discount?: number;
  price?: number;
  itemId: string;
  model: CartModel;
}) => {
  const getContent = useLocale();

  if (!owner) return null;
  return (
    <Fragment>
      <div className={classes.main}>
        <div className={classes.titleBox}>
          <span className={`${classes.title} ${tmdDemiBold}`}>
            {getContent(cartTitle)}
          </span>
          {cartTitleTail}
        </div>
        {owner}
        <div className={classes.priceBox}>
          {!!discount && (
            <div className={classes.priceHeader}>
              <s
                className={`${classes.strike} ${tsmRegular}`}
              >{`${currencize(price || 0)} ${getContent("toman")}`}</s>
              <span className={`${classes.percent} ${t2xsRegular}`}>
                {getContent("percentSymbol", [
                  Math.ceil(discount / (price || 1)).toString(),
                ])}
              </span>
            </div>
          )}
          <span className={`${classes.price} ${tlgBold}`}>
            {`${currencize((price || 0) - (discount || 0))} ${getContent("toman")}`}
          </span>
          {!!discount && (
            <p className={`${classes.saved} ${t2xsRegular}`}>
              {getContent("youSavedxToman", [currencize(discount)])}
            </p>
          )}
        </div>
        <CartActions itemId={itemId} model={model} />
        <ProductCartInfos />
      </div>
      <PlusBox value={discount || 0} />
    </Fragment>
  );
};

export default CartablePageCartSection;
