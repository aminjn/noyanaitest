"use client";
import { IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import DrugCard from "./DrugCard";
import { ListPage } from "../Disease/DiseasesListPage";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import useLocale from "../Hooks/useLocale";
import ListPageIntro from "../UI/ListPage/ListPageIntro";
import BigAd from "../UI/ListPage/BigAd";
import useDebounce from "../Hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import useProgress from "../Hooks/useProgress";
import { useEffect } from "react";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import ListPageList from "../UI/ListPage/ListPageList";

export type DrugsListPageProps = {
  data: IDrug<{ Tag: Record<never, never> }>[];
  pagesCount: number;
};

const DrugsListPage = ({ data, pagesCount }: DrugsListPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    if (query) push(`/drug?search=${query}`);
  }, [query, push]);

  return (
    <ListPageLayout>
      <ListPageHeader
        title={getContent("drugsListTitle")}
        legend={getContent("drugsListLegend")}
      />
      <ListPageIntro
        title={getContent("drugsListIntroTitle")}
        description={getContent("drugsListIntroDescription")}
      />
      <ListPageSearch
        placeholder={getContent("searchInDrugs")}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ListPageList
        itemWidth="22.8125rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            return `/drug?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <DrugCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <BigAd />
    </ListPageLayout>
  );
};

export default DrugsListPage;
