import { Fragment, ReactNode, useMemo, useState } from "react";
import {
  IProduct,
  IProductSeller,
} from "../Admin/Product/AdminManageProductsPage";
import useCart from "../Hooks/useCart";
import useLocale from "../Hooks/useLocale";
import classes from "./ProductCart.module.css";
import Ixon from "../UI/Ixon";
import VolleyBallIcon from "../Icons/VolleyBallIcon";
import { currencize } from "../helpers/currencize";
import MinusIcon from "../Icons/MinusIcon";
import PlusIcon from "../Icons/PlusIcon";
import Button from "../UI/Button";
import CartIcon from "../Icons/CartIcon";
import TruckIcon from "../Icons/TruckIcon";
import LocationIcon from "../Icons/LocationIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import Badge from "../UI/Badge";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import {
  t2xsRegular,
  tlgBold,
  tmdDemiBold,
  tsmRegular,
  txsMedium,
} from "../UI/Typography";
import PlusBox from "./PlusBox";
import CartActions from "./CartActions";
import ProductCartInfos from "./ProductCartInfos";

const ProductCart = ({
  data,
}: {
  data: IProduct<{ Sellers: { Seller: Record<never, never> } }>;
}) => {
  const { cart, mutateCartItem, isLoading, getItemQty } = useCart();

  const currentSeller = useMemo<
    IProductSeller<{ Seller: Record<never, never> }>
  >(() => {
    return (
      cart?.products.find((el) => el.item._id === data._id)?.item ||
      data.sellers[0]
    );
  }, [cart?.products, data._id, data.sellers]);

  const getContent = useLocale();

  if (!currentSeller) return null;
  return (
    <Fragment>
      <div className={classes.main}>
        <div className={classes.titleBox}>
          <span className={`${classes.title} ${tmdDemiBold}`}>
            {getContent("seller")}
          </span>
          {data.sellers.length > 1 && (
            <span className={`${classes.otherCount} ${txsMedium}`}>
              {getContent("nOtherSellers", [
                (data.sellers.length - 1).toString(),
              ])}
            </span>
          )}
        </div>
        <div className={classes.seller}>
          <Ixon className={classes.sellerIcon} width="1.25rem">
            <VolleyBallIcon />
          </Ixon>
          <div className={classes.sellerContent}>
            <span className={classes.sellerName}>
              {currentSeller.seller.name}
            </span>
          </div>
        </div>
        <div className={classes.priceBox}>
          {!!currentSeller.discount && (
            <div className={classes.priceHeader}>
              <s
                className={`${classes.strike} ${tsmRegular}`}
              >{`${currencize(currentSeller.price || 0)} ${getContent("toman")}`}</s>
              <span className={`${classes.percent} ${t2xsRegular}`}>
                {getContent("percentSymbol", [
                  Math.ceil(
                    currentSeller.discount / (currentSeller.price || 1),
                  ).toString(),
                ])}
              </span>
            </div>
          )}
          <span className={`${classes.price} ${tlgBold}`}>
            {`${currencize((currentSeller.price || 0) - (currentSeller.discount || 0))} ${getContent("toman")}`}
          </span>
          {!!currentSeller.discount && (
            <p className={`${classes.saved} ${t2xsRegular}`}>
              {getContent("youSavedxToman", [
                currencize(currentSeller.discount),
              ])}
            </p>
          )}
        </div>
        <CartActions itemId={currentSeller._id} model="products" />
        <ProductCartInfos />
      </div>
      <PlusBox value={currentSeller.discount || 0} />
    </Fragment>
  );
};

export default ProductCart;
