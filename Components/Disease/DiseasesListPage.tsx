"use client";
import { useParams, useSearchParams } from "next/navigation";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import useLocale from "../Hooks/useLocale";
import Pagination, { PagePathMaker } from "../UI/Pagination";
import classes from "./DiseasesListPage.module.css";
import DiseaseCard from "./DiseaseCard";
import { ReactNode, useEffect } from "react";
import { ContentKey } from "../Enums/contentKeys";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageIntro from "../UI/ListPage/ListPageIntro";
import BigAd from "../UI/ListPage/BigAd";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import useDebounce from "../Hooks/useDebounce";
import useProgress from "../Hooks/useProgress";
import ListPageList from "../UI/ListPage/ListPageList";
import SmallAd from "../UI/ListPage/SmallAd";
import { IDiseaseCategory } from "../Admin/DiseaseCategory/AdminManageDiseaseCategoriesPage";
import Ixon from "../UI/Ixon";
import FilterIcon from "../Icons/FilterIcon";
import Link from "next/link";
import { txsMedium } from "../UI/Typography";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";

export const ListPage = ({
  children,
  title,
  pagesCount,
  switchPage,
}: {
  children?: ReactNode;
  title: ContentKey;
  pagesCount: number;
  switchPage: PagePathMaker;
}) => {
  const { page } = useParams<{ page: string }>();
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <h1 className={classes.title}>{getContent(title)}</h1>
      <div className={classes.content}>
        <ul className={classes.list}>{children}</ul>
        <Pagination
          className={classes.center}
          pagesCount={pagesCount}
          currentPage={Number(page || 1)}
          makePath={switchPage}
        />
      </div>
    </div>
  );
};

export type DiseasesListPageProps = {
  data: IDisease<{
    Tag: Record<never, never>;
    Category: Record<never, never>;
  }>[];
  pagesCount: number;
  categories: IDiseaseCategory[];
};
const DiseasesListPage = ({
  data,
  pagesCount,
  categories,
}: DiseasesListPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    if (query) push(`/disease?search=${query}`);
  }, [query, push]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "بیماری ها", target: "/disease" },
      ]}
    >
      <ListPageHeader
        title={getContent("diseasesListTitle")}
        legend={getContent("diseasesListLegend")}
      />
      <ListPageIntro
        title={getContent("diseasesListIntroTitle")}
        description={getContent("diseasesListIntroDescription")}
      />
      <BigAd />
      <ListPageSearch
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getContent("searchInDiseases")}
      />
      <ListPageCategorySelector categories={categories} basePath={`/disease`} />
      <ListPageList
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            return `/disease?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
        itemWidth="22.8125rem"
      >
        {data.map((node) => (
          <DiseaseCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd />
    </ListPageLayout>
  );
};

export default DiseasesListPage;
