"use client";

import useLocale from "../Hooks/useLocale";
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
import { t4xlBold, tlgBold, tmdMedium } from "../UI/Typography";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";

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
  const getContent = useLocale();

  const { data } = useSWR<ProductNode[]>(
    `${API}/public/product?page=1`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  if (!data?.length) return null;

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Link href={"/product"} className={classes.chevron}>
          <Ixon width="1.5rem">
            <DoubleChevronIcon />
          </Ixon>
        </Link>
        <div className={classes.titleBox}>
          <h2 className={tlgBold}>{getContent("homePharmacyProductsTitle")}</h2>
          <Ixon width="1.5rem">
            <CrownIcon />
          </Ixon>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.intro}>
          <span className={classes.iconBox}>
            <Ixon width="3rem">
              <PillIcon />
            </Ixon>
          </span>
          <h3 className={`${classes.secondaryTitle} ${t4xlBold}`}>
            {getContent("noyanProductsTitle")}
          </h3>
          <p className={`${classes.description} ${tmdMedium}`}>
            {getContent("noyanProductsDescription")}
          </p>
          <Link href={"/product"} className={`${classes.action} ${tmdMedium}`}>
            <span>{getContent("seeProducts")}</span>
            <Ixon width="1.5rem">
              <ArrowLeftIcon />
            </Ixon>
          </Link>
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
