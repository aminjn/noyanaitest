"use client";

import classes from "./ProductListPage.module.css";
import { useSearchParams } from "next/navigation";
import {
  IProduct,
  IProductSeller,
} from "../Admin/Product/AdminManageProductsPage";
import { IProductCategory } from "../Admin/ProductCategory/AdminManageProductCategoriesPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import useDebounce from "../Hooks/useDebounce";
import useLocale from "../Hooks/useLocale";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import useProgress from "../Hooks/useProgress";
import { useEffect } from "react";
import ListPageHeaderSearch from "../UI/ListPage/ListPageHeaderSearch";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import SpecialsBox from "../Clinic/SpecialsBox";
import Calendar02Icon from "../Icons/Calendar02Icon";
import ListPageHeaderToggle from "../UI/ListPage/ListPageHeaderToggle";
import ListPageList from "../UI/ListPage/ListPageList";
import ProductCard from "./ProductCard";
import SwitchProductAndService from "./SwitchProductAndService";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import { currencize } from "../helpers/currencize";
import useScopedLocale from "../Hooks/useScopedLocale";
import { t2xsMedium, tsmBold, txsDemiBold } from "../UI/Typography";

export type ProductListPageProps = {
  data: (
    | (IProduct<{
        Sellers: { Seller: Record<never, never> };
        Category: Record<never, never>;
      }> & {
        model: "Product";
      })
    | (IProductPackage<{
        Owner: Record<never, never>;
        Products: Record<never, never>;
        Category: Record<never, never>;
      }> & { model: "ProductPackage" })
  )[];
  specials: IProductSeller<{
    Product: Record<never, never>;
    Seller: Record<never, never>;
  }>[];
  categories: IProductCategory[];
  count: number;
  pagesCount: number;
};

const SpecialItem = ({
  node,
}: {
  node: IProductSeller<{
    Product: Record<never, never>;
    Seller: Record<never, never>;
  }>;
}) => {
  const getContent = useScopedLocale(["common"]);

  return (
    <div className={classes.item}>
      <div className={classes.image}>
        <HostedImage
          src={node.product.image}
          alt={node.product.name}
          fill
          sizes="4rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.content}>
        <div className={classes.score}>
          <span>{node.product.averageScore}</span>
          <Ixon width="1rem">
            <StarIcon />
          </Ixon>
        </div>
        <span className={`${classes.name} ${tsmBold}`}>
          {node.product.name}
        </span>
        <span className={`${classes.seller} ${t2xsMedium}`}>
          {node.seller.name}
        </span>
        <span className={`${classes.price} ${txsDemiBold}`}>
          {getContent("xToman", [currencize(node.price || 0)])}
        </span>
      </div>
    </div>
  );
};

const ProductListPage = ({
  categories,
  count,
  data,
  pagesCount,
  specials,
}: ProductListPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    const category = searchParams.get("category");
    if (category) params.append("category", category);
    if (query) params.append("search", query);
    const packageOnly = !!searchParams.get("packageOnly");
    if (packageOnly) params.append("packageOnly", "1");
    push(`/product?${params.toString()}`);
  }, [searchParams, query, push]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "محصولات", target: "/product" },
      ]}
    >
      <SwitchProductAndService />
      <ListPageHeaderSearch
        title={getContent("productListPageTitle")}
        legend={getContent("productListPageLegend")}
        placeholder={getContent("searchInProducts")}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ListPageCategorySelector basePath={"/product"} categories={categories} />
      {!!specials.length && (
        <SpecialsBox
          icon={<Calendar02Icon />}
          badge={getContent("productListPageSpecialBadge")}
          button={getContent("productListPageSpecialButton")}
          description={getContent("productListPageSpecialDescription")}
          title={getContent("productListPageSpecialTitle")}
        >
          {specials.map((node) => (
            <SpecialItem node={node} key={node._id} />
          ))}
        </SpecialsBox>
      )}
      <ListPageHeaderToggle
        count={count}
        active={!!searchParams.get("packageOnly")}
        onChange={() => {
          const currennt = !!searchParams.get("packageOnly");
          const params = new URLSearchParams();
          if (query) params.append("search", query);
          const category = searchParams.get("category");
          if (category) params.append("category", category);
          if (!currennt) params.append("packageOnly", "1");
          push(`/product?${params.toString()}`);
        }}
      />
      <ListPageList
        itemWidth="16.5rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            const category = searchParams.get("category");
            if (category) params.append("category", category);
            const packageOnly = searchParams.get("packageOnly");
            if (packageOnly) params.append("packageOnly", "1");
            return `/product?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <ProductCard node={node} key={node._id} />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default ProductListPage;
