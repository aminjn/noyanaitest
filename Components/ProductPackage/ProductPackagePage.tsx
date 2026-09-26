"use client";
import classes from "./ProductPackagePage.module.css";

import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import ProductPackagePageIntro from "./ProductPackagePageIntro";
import ClientTabSystem from "../UI/ClientTabSystem";
import ProductPackagePageTabs, { DiffCalc } from "./ProductPackagePageTabs";
import ProductPackagePageSameAs from "./ProductPackagePageSameAs";
import ProductPackagePageCart from "./ProductPackagePageCart";
import { Fragment } from "react";
import CartableNodePage from "../Product/Cartable/CartabaleNodePage";
import ProductCard from "../Product/ProductCard";
import StarDotPlusIcon from "../Icons/StartDotPlusIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ProductTab, WhyBox } from "../Product/ProductTabs";
import { tbaseRegular, tsmRegular } from "../UI/Typography";
import RenderRtf from "../UI/RenderRtf";
import CommentSection from "../Comment/CommentSection";
import Image from "next/image";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import ThinOwner from "./ThinOwner";

const NS: ContentNamespace[] = ["common", "productPackagePage"];

export type ProductPackagePageProps = {
  data: IProductPackage<{
    Category: Record<never, never>;
    Owner: Record<never, never>;
    Specs: Record<never, never>;
    Images: Record<never, never>;
    Products: Record<never, never>;
    SameAs: {
      Owner: Record<never, never>;
      Products: Record<never, never>;
      Category: Record<never, never>;
    };
  }>;
};

const ProductPackagePage = ({ data }: ProductPackagePageProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <CartableNodePage
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("products"), target: "/product" },
        {
          title: data.name || data._id,
          target: `/productPackage/${data.slug || data._id}`,
        },
      ]}
      cartTitle="provider"
      commentsCount={data.commentCount}
      images={data.images}
      itemId={data._id}
      model="productPackages"
      qnaCount={500}
      sameAs={data.sameAs.map((el) => (
        <ProductCard key={el._id} node={{ ...el, model: "ProductPackage" }} />
      ))}
      sameAsIcon={<StarDotPlusIcon />}
      sameAsTitle="similarPackages"
      score={data.averageScore}
      specs={data.specs}
      totalScore={data.commentCount}
      category={data.category ? { name: data.category.name } : undefined}
      discount={data.discount}
      name={data.name}
      price={data.price}
      owner={<ThinOwner name={data.owner.name} src={data.owner.avatar} />}
      tabs={[
        {
          id: "Description",
          title: getContent("aboutPackage"),
          content: (
            <ProductTab title={getContent("packageIntroduction")}>
              <p className={`${classes.summary} ${tsmRegular}`}>
                {data.summary}
              </p>
              <DiffCalc items={data.products} price={data.price} />
              <RenderRtf value={data.description} />
              <WhyBox content={data.whyChoose} />
            </ProductTab>
          ),
        },
        {
          id: "Comments",
          content: (
            <div className={classes.comments}>
              <CommentSection model="ProductPackage" nodeId={data._id} />
            </div>
          ),
          title: getContent("comments"),
        },
      ]}
    />
  );
};

export default ProductPackagePage;
