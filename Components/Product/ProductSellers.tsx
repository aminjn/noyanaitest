import Link from "next/link";
import { IProductSeller } from "../Admin/Product/AdminManageProductsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import LocationIcon from "../Icons/LocationIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import Ixon from "../UI/Ixon";
import classes from "./ProductSellers.module.css";
import Button from "../UI/Button";
import ChevronIcon from "../Icons/ChevronIcon";
import {
  t2xsRegular,
  tbaseMedium,
  tsmBold,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import useCart from "../Hooks/useCart";
import Image from "next/image";
import { FilePath } from "../config";
import VerifyIcon from "../Icons/VerifyIcon";
import StarIcon from "../Icons/StarIcon";
import { currencize } from "../helpers/currencize";
import Badge from "../UI/Badge";
import { useMemo } from "react";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "products"];

const Item = ({
  node,
  cheapest,
}: {
  node: IProductSeller<{ Seller: { Province: Record<never, never> } }>;
  cheapest: boolean;
}) => {
  const { mutateCartItem } = useCart();

  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.item}>
      <div className={classes.itemImage}>
        <HostedImage
          alt={node.seller.name || ""}
          src={node.seller.avatar}
          fill
          sizes="3rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.itemContent}>
        <div className={classes.itemHeader}>
          <span>{node.seller.name}</span>
          <Ixon width=".75rem" className={classes.itemVerifyIcon}>
            <VerifyIcon />
          </Ixon>
        </div>
        <div className={classes.itemBody}>
          {!!node.seller.province && (
            <div className={`${classes.province} ${txsMedium}`}>
              <Ixon width=".75rem">
                <LocationIcon />
              </Ixon>
              <span>{node.seller.province.name}</span>
            </div>
          )}
          <div className={classes.stats}>
            <div className={`${classes.score} ${t2xsRegular}`}>
              <Ixon width="1rem">
                <StarIcon />
              </Ixon>
              <span>4.5</span>
            </div>
            <span className={classes.count}>{`(${currencize(1242)})`}</span>
          </div>
        </div>
        <div className={classes.itemFooter}>
          {!!node.freeDelivery && (
            <Badge color="Success" size="S" mode="Fill" radius="High">
              {getContent("freeDelivery")}
            </Badge>
          )}
          {!!node.fastDelivery && (
            <Badge color="Primarylight" size="S" mode="Fill" radius="High">
              {getContent("fastDelivery")}
            </Badge>
          )}
          {!!cheapest && (
            <Badge color="Primarylight" size="S" mode="Fill" radius="High">
              {getContent("cheapest")}
            </Badge>
          )}
        </div>
      </div>
      <div className={classes.itemTail}>
        {!!cheapest && (
          <Badge color="Error" mode="Fill" size="S" radius="High">
            {getContent("cheapest")}
          </Badge>
        )}
        <span className={`${classes.itemPrice} ${tsmBold}`}>
          {getContent("xToman", [
            currencize((node.price || 0) - (node.discount || 0)),
          ])}
        </span>
        <Button
          variant="Primary"
          mode="Fill"
          radius="High"
          size="XL"
          onClick={() => mutateCartItem({ item: node._id, model: "products" })}
        >
          {getContent("choose")}
        </Button>
      </div>
    </div>
  );
};

const ProductSellers = ({
  data,
}: {
  data: IProductSeller<{ Seller: { Province: Record<never, never> } }>[];
}) => {
  const getContent = useScopedLocale(NS);

  const cheapest = useMemo(
    () =>
      data.reduce(
        (acc, el) => (!!el.price ? (el.price < acc ? el.price : acc) : acc),
        Number.MAX_SAFE_INTEGER,
      ),
    [data],
  );

  if (!data.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <div className={classes.header}>
          <div className={`${classes.titleBox} ${tbaseMedium}`}>
            <Ixon className={classes.locationIcon} width="1.25rem">
              <LocationIcon />
            </Ixon>
            <span>{`${getContent("availableSellers")} (${getContent("nSellers", [data.length.toString()])})`}</span>
          </div>
        </div>
        <div className={classes.list}>
          {data.map((item) => (
            <Item
              key={item._id}
              node={item}
              cheapest={!!cheapest && cheapest === item.price}
            />
          ))}
        </div>
      </div>
      <div className={classes.footer}>
        <div className={`${classes.footerBox} ${txsRegular}`}>
          <Ixon width="1rem">
            <ShieldIcon />
          </Ixon>
          <span>{getContent("sellersFooterText")}</span>
        </div>
        <Button
          href="/pharmacy"
          variant="Primary"
          mode="Outline"
          size="S"
          radius="Medium"
          tailIcon={<ChevronIcon />}
        >
          {getContent("seeAll")}
        </Button>
      </div>
    </div>
  );
};

export default ProductSellers;
