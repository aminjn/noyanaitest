import Link from "@/Components/i18n/Link";
import { IProductSeller } from "../Admin/Product/AdminManageProductsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import LocationIcon from "../Icons/LocationIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import Ixon from "../UI/Ixon";
import classes from "./ProductSellers.module.css";
import Button from "../UI/Button";
import {
  tbaseMedium,
  tsmBold,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import useCart from "../Hooks/useCart";
import VerifyIcon from "../Icons/VerifyIcon";
import { currencize } from "../helpers/currencize";
import Badge from "../UI/Badge";
import { useMemo } from "react";
import HostedImage from "../UI/HostedImage";
import DeliveryAreaNote, { DeliveryArea } from "../Pharmacy/DeliveryAreaNote";

const NS: ContentNamespace[] = ["common", "products"];

const finalPrice = (el: { price?: number; discount?: number }) =>
  Math.max(0, (el.price || 0) - (el.discount || 0));

// where the seller ships it (2026-10, backend getProduct)
type SellerNode = IProductSeller<{ Seller: { Province: Record<never, never> } }> & {
  deliveryArea?: DeliveryArea;
};

const Item = ({
  node,
  cheapest,
  rx,
}: {
  node: SellerNode;
  cheapest: boolean;
  // the product is prescription-only: it ships only in the seller's city
  rx?: boolean;
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
          <Link href={`/pharmacy/${node.seller.slug || node.seller._id}`}>{node.seller.name}</Link>
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
          <DeliveryAreaNote area={node.deliveryArea} rx={rx} />
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
            currencize(finalPrice(node)),
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
  rx,
}: {
  data: SellerNode[];
  rx?: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  // what the buyer pays; "cheapest" only means something with 2+ offers
  const cheapest = useMemo(
    () =>
      data.length > 1
        ? Math.min(...data.map((el) => finalPrice(el)))
        : 0,
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
              cheapest={!!cheapest && cheapest === finalPrice(item)}
              rx={rx}
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
      </div>
    </div>
  );
};

export default ProductSellers;
