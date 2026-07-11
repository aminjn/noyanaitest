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

const Info = ({ content, icon }: { icon: ReactNode; content: string }) => {
  return (
    <div className={classes.info}>
      <Ixon width=".75rem" className={classes.infoIcon}>
        {icon}
      </Ixon>
      <span>{content}</span>
    </div>
  );
};

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
        <div className={classes.headers}>
          <div className={classes.titleBox}>
            <span className={classes.title}>{getContent("seller")}</span>
            {data.sellers.length > 1 && (
              <span className={classes.otherCount}>
                {getContent("nOtherSellers", [
                  (data.sellers.length - 1).toString(),
                ])}
              </span>
            )}
          </div>
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
                className={classes.strike}
              >{`${currencize(currentSeller.price)} ${getContent("toman")}`}</s>
              <span className={classes.pecent}>
                {getContent("percentSymbol", [
                  Math.ceil(
                    currentSeller.discount / currentSeller.price,
                  ).toString(),
                ])}
              </span>
            </div>
          )}
          <span className={classes.price}>
            {`${currencize(currentSeller.price - currentSeller.discount)} ${getContent("toman")}`}
          </span>
          {!!currentSeller.discount && (
            <p className={classes.saved}>
              {getContent("youSavedxToman", [
                currencize(currentSeller.discount),
              ])}
            </p>
          )}
        </div>
        <div className={classes.cart}>
          {!!getItemQty({ itemId: currentSeller._id, model: "products" }) ? (
            <div className={classes.selector}>
              <button className={classes.crease}>
                <Ixon width="1rem">
                  <MinusIcon />
                </Ixon>
              </button>
              <span>
                {getItemQty({ itemId: currentSeller._id, model: "products" })}
              </span>
              <button className={classes.crease}>
                <Ixon width="1rem">
                  <PlusIcon />
                </Ixon>
              </button>
            </div>
          ) : (
            <Button
              variant="Error"
              mode="Fill"
              size="M"
              radius="Medium"
              tailIcon-={<CartIcon />}
            >
              {getContent("addToCart")}
            </Button>
          )}
        </div>
        <div className={classes.infos}>
          <Info icon={<TruckIcon />} content={getContent("cartInfoItem0")} />
          <Info icon={<LocationIcon />} content={getContent("cartInfoItem1")} />
          <Info icon={<ShieldIcon />} content={getContent("cartInfoItem2")} />
        </div>
      </div>
      <div className={classes.plusBox}>
        <Badge
          leadIcon={<StarsSolidIcon />}
          size="L"
          mode="Fill"
          color="SecondaryLight"
        >
          {getContent("plusMembers")}
        </Badge>
        <p className={classes.plusText}>
          <span>{getContent("plusTextPre")}</span>
          <span className={classes.plusPrice}>
            {getContent("xToman", [currencize(currentSeller.discount)])}
          </span>
          <span>{getContent("plusTextPost")}</span>
        </p>
        <Button variant="Primary" mode="Fill" size="M" radius="Medium">
          {getContent("seeOtherBenefits")}
        </Button>
      </div>
    </Fragment>
  );
};

export default ProductCart;
