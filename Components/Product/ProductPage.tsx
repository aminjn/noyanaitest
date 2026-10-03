"use client";
import { Fragment, useMemo } from "react";
import {
  IProduct,
  IProductSeller,
} from "../Admin/Product/AdminManageProductsPage";
import classes from "./ProductPage.module.css";
import Ixon from "../UI/Ixon";
import ShareIcon from "../Icons/ShareIcon";
import VerifyIcon from "../Icons/VerifyIcon";
import ProductPageIntro from "./ProductPageIntro";
import ProductSellers from "./ProductSellers";
import ProductTabs, { ProductTab, WhyBox } from "./ProductTabs";
import ProductSameAs from "./ProductSameAs";
import ProductCart from "./ProductCart";
import CartableNodePage from "./Cartable/CartabaleNodePage";
import Image from "next/image";
import { FilePath } from "../config";
import Link from "@/Components/i18n/Link";
import { t2xsRegular, txsDemiBold, txsMedium } from "../UI/Typography";
import ShoppingCartIcon from "../Icons/ShoppingCartIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import RenderRtf from "../UI/RenderRtf";
import BookAltIcon from "../Icons/BookAltIcon";
import TagIcon from "../Icons/TagIcon";
import PillIcon from "../Icons/PillIcon";
import AlertTriangleIcon from "../Icons/AlertTriangleIcon";
import CommentSection from "../Comment/CommentSection";
import StarIcon from "../Icons/StarIcon";
import useCart from "../Hooks/useCart";
import VolleyBallIcon from "../Icons/VolleyBallIcon";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "products"];

export type ProductPageProduct = IProduct<{
  Category: Record<never, never>;
  Images: Record<never, never>;
  Specs: Record<never, never>;
  Sellers: { Seller: { Province: Record<never, never> } };
  SameAs: { Category: Record<never, never> };
}>;

export type ProductPageProps = {
  data: ProductPageProduct;
};

const Item = ({
  node,
}: {
  node: IProduct<{ Category: Record<never, never> }>;
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.image}>
        <HostedImage
          alt={node.name || ""}
          src={node.image}
          style={{ objectFit: "contain" }}
          fill
          sizes="4rem"
        />
      </div>
      <div className={classes.itemContent}>
        <Link href={`/product/${node.slug || node._id}`}>
          <span className={`${classes.itemName} ${txsDemiBold}`}>
            {node.name}
          </span>
        </Link>
        {!!node.category && (
          <span className={`${classes.category} ${t2xsRegular}`}>
            {node.category.name}
          </span>
        )}
      </div>
    </div>
  );
};

const ProductPage = ({ data }: ProductPageProps) => {
  const getContent = useScopedLocale(NS);

  const { cart } = useCart();

  const currentSeller = useMemo<
    IProductSeller<{ Seller: Record<never, never> }> | undefined
  >(() => {
    return (
      cart?.products.find((el) => el.item._id === data._id)?.item ||
      data.sellers?.[0]
    );
  }, [cart?.products, data._id, data.sellers]);

  return (
    <CartableNodePage
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("products"), target: "/product" },
        {
          title: data.name || data._id,
          target: `/product/${data.slug || data._id}`,
        },
      ]}
      commentsCount={data.commentCount}
      images={data.images}
      sameAs={data.sameAs.map((item) => (
        <Item key={item._id} node={item} />
      ))}
      sameAsIcon={<ShoppingCartIcon />}
      sameAsTitle={"othersAlsoBoughtThese"}
      score={data.averageScore}
      specs={data.specs}
      totalScore={data.commentCount}
      beforeTabs={<ProductSellers data={data.sellers} />}
      category={data.category ? { name: data.category.name || "" } : undefined}
      name={data.name}
      original={data.original}
      cartTitle={"seller"}
      itemId={currentSeller?._id || ""}
      model={"products"}
      cartTitleTail={
        (data.sellers?.length || 0) > 1 && (
          <span className={`${classes.otherCount} ${txsMedium}`}>
            {getContent("nOtherSellers", [
              (data.sellers.length - 1).toString(),
            ])}
          </span>
        )
      }
      discount={currentSeller?.discount}
      price={currentSeller?.price || 0}
      fastDelivery={!!currentSeller?.fastDelivery}
      freeDelivery={!!currentSeller?.freeDelivery}
      owner={
        <div className={classes.seller}>
          <Ixon className={classes.sellerIcon} width="1.25rem">
            <VolleyBallIcon />
          </Ixon>
          <div className={classes.sellerContent}>
            {currentSeller?.seller ? (
              <Link
                className={classes.sellerName}
                href={`/pharmacy/${currentSeller.seller.slug || currentSeller.seller._id}`}
              >
                {currentSeller.seller.name}
              </Link>
            ) : null}
          </div>
        </div>
      }
      tabs={[
        {
          content: (
            <ProductTab title={getContent("description")} key={"Description"}>
              <RenderRtf value={data.description} />
              <WhyBox content={data.whyChoose} />
            </ProductTab>
          ),
          id: "Description",
          title: getContent("description"),
          exclude: !data.description && !data.whyChoose,
          icon: <BookAltIcon />,
        },
        {
          content: (
            <ProductTab title={getContent("details")} key={"Details"}>
              <RenderRtf value={data.details} />
            </ProductTab>
          ),
          id: "Details",
          title: getContent("details"),
          exclude: !data.details,
          icon: <TagIcon />,
        },
        {
          title: getContent("productUsage"),
          id: "Usage",
          exclude: !data.usage,
          icon: <PillIcon />,
          content: (
            <ProductTab title={getContent("productUsage")} key="Usage">
              <RenderRtf value={data.usage} />
            </ProductTab>
          ),
        },
        {
          title: getContent("warnings"),
          id: "Warnings",
          exclude: !data.warning,
          content: (
            <ProductTab title={getContent("warnings")} key={"Warning"}>
              <RenderRtf value={data.warning} />
            </ProductTab>
          ),
          icon: <AlertTriangleIcon />,
        },
        {
          title: getContent("comments"),
          id: "Comments",
          content: <CommentSection model="Product" nodeId={data._id} />,
          icon: <StarIcon />,
        },
      ]}
    />
  );
};

export default ProductPage;
