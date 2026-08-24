"use client";

import classes from "./ServiceListPage.module.css";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import useLocale from "../Hooks/useLocale";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import useDebounce from "../Hooks/useDebounce";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useProgress from "../Hooks/useProgress";
import SpecialsBox from "../Clinic/SpecialsBox";
import Calendar02Icon from "../Icons/Calendar02Icon";
import ListPageList from "../UI/ListPage/ListPageList";
import ServiceCard from "./ServiceCard";
import { IServicePackage } from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import ToggleButton from "../UI/RTFEditor/ToggleButton";
import ToggleInput from "../UI/ToggleInput";
import {
  t2xsRegular,
  tbaseMedium,
  tlgDemiBold,
  txsMedium,
} from "../UI/Typography";
import ListPageHeaderSearch from "../UI/ListPage/ListPageHeaderSearch";
import ListPageHeaderToggle from "../UI/ListPage/ListPageHeaderToggle";
import SwitchProductAndService from "../Product/SwitchProductAndService";

export type ServiceListPageProps = {
  data: (
    | (IService<{
        Category: Record<never, never>;
        Owner: { Province: Record<never, never> };
      }> & { model: "Service" })
    | (IServicePackage<{
        Owner: { Province: Record<never, never> };
        Category: Record<never, never>;
        Services: Record<never, never>;
      }> & { model: "ServicePackage" })
  )[];
  pagesCount: number;
  specials: IService<{ Owner: Record<never, never> }>[];
  categories: IServiceCategory[];
  count: number;
};

const SpecialItem = ({
  node,
}: {
  node: IService<{ Owner: Record<never, never> }>;
}) => {
  return <></>;
};

const ServiceListPage = ({
  categories,
  data,
  pagesCount,
  specials,
  count,
}: ServiceListPageProps) => {
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
    push(`/service?${params.toString()}`);
  }, [searchParams, query, push]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "خدمات", target: "/service" },
      ]}
    >
      <SwitchProductAndService />
      <ListPageHeaderSearch
        legend={getContent("serviceListLegend")}
        title={getContent("serviceListTitle")}
        placeholder={getContent("searchInServices")}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ListPageCategorySelector categories={categories} basePath={"/service"} />
      {!!specials.length && (
        <SpecialsBox
          title={getContent("specialServicesTitle")}
          badge={getContent("specialServicesBadge")}
          button={getContent("specialServicesButton")}
          description={getContent("specialServicesDescription")}
          icon={<Calendar02Icon />}
        >
          {specials.map((node) => (
            <SpecialItem key={node._id} node={node} />
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
          push(`/service?${params.toString()}`);
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
            return `/service?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <ServiceCard node={node} key={node._id} />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default ServiceListPage;
