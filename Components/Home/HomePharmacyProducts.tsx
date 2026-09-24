"use client";

import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./HomePharmacyProducts.module.css";
import Ixon from "../UI/Ixon";
import CrownIcon from "../Icons/CrownIcon";
import Link from "next/link";
import DoubleChevronIcon from "../Icons/DoubleChevronIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import PillIcon from "../Icons/PillIcon";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";
import ProductCard from "../Product/ProductCard";
import {
  t4xlBold,
  tlgBold,
  tmdMedium,
  tsmRegular,
  txlDemiBold,
} from "../UI/Typography";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import Image from "next/image";
import Button from "../UI/Button";
import productsImage from "./products.png";

const NS: ContentNamespace[] = ["common", "home"];

type ProductNode =
  | (IProduct<{
      Sellers: { Seller: Record<never, never> };
      Category: Record<never, never>;
    }> & { model: "Product" })
  | (IProductPackage<{
      Owner: Record<never, never>;
      Products: Record<never, never>;
      Category: Record<never, never>;
    }> & { model: "ProductPackage" });

// New section added by the Aug 2026 home page redesign — a "best-selling
// pharmacy products" carousel, mirroring HomeServices' layout but for the
// existing Components/Product catalog. The public product endpoint doesn't
// have a dedicated "best sellers" sort yet, so this shows the default
// (first-page) listing; swap the query below once/if the backend adds one.
const HomePharmacyProducts = () => {
  const getContent = useScopedLocale(NS);

  const { data } = useSWR<ProductNode[]>(
    `${API}/public/product?page=1`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  if (!data?.length) return null;

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={classes.titleBox}>
          <Ixon width="1.5rem">
            <CrownIcon />
          </Ixon>
          <h2 className={tlgBold}>{getContent("homePharmacyProductsTitle")}</h2>
        </div>
        <Link href={"/product"} className={classes.chevron}>
          <Ixon width="1.5rem" style={{ transform: "rotateZ(180deg)" }}>
            <DoubleChevronIcon />
          </Ixon>
        </Link>
      </div>
      <div className={classes.content}>
        <div className={classes.intro}>
          <div className={classes.image}>
            <Image
              src={productsImage}
              alt={"Noyan Products"}
              fill
              style={{ objectFit: "contain" }}
              sizes="12rem"
            />
          </div>
          <div className={classes.introContent}>
            <h3 className={`${classes.secondareyTitle} ${txlDemiBold}`}>
              {getContent("noyanProductsTitle")}
            </h3>
            <p className={`${classes.description} ${tsmRegular}`}>
              {getContent("noyanProductsDescription")}
            </p>
            <Button
              href={"/product"}
              tailIcon={<ArrowLeftIcon />}
              className={classes.action}
              variant="Secondary"
              mode="Outline"
              size="L"
              radius="Medium"
            >
              {getContent("seeProducts")}
            </Button>
          </div>
        </div>
        <div className={classes.list}>
          <SwiperSlider>
            {data.map((node) => (
              <SwiperSlide tag="li" key={node._id} className={classes.slide}>
                <ProductCard node={node} />
              </SwiperSlide>
            ))}
          </SwiperSlider>
        </div>
      </div>
    </div>
  );
};

export default HomePharmacyProducts;
