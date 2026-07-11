"use client";
import { Fragment } from "react";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import classes from "./ProductPage.module.css";
import Ixon from "../UI/Ixon";
import ShareIcon from "../Icons/ShareIcon";
import VerifyIcon from "../Icons/VerifyIcon";
import ProductPageIntro from "./ProductPageIntro";
import ProductSellers from "./ProductSellers";
import ProductTabs from "./ProductTabs";
import ProductSameAs from "./ProductSameAs";
import ProductCart from "./ProductCart";

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

const ProductPage = ({ data }: ProductPageProps) => {
  console.log(data);
  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <ProductPageIntro data={data} />
        <ProductSellers data={data.sellers} />
        <ProductTabs data={data} />
        <ProductSameAs data={data.sameAs} />
      </div>
      <div className={classes.side}>
        <ProductCart data={data} />
      </div>
    </div>
  );
};

export default ProductPage;
