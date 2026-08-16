"use client";

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
  return <div>sp</div>;
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
