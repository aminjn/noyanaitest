"use client";
import { ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import SymptomCard from "./SymptomCard";
import { ListPage } from "../Disease/DiseasesListPage";
import classes from "./SymptomsListPage.module.css";
import useLocale from "../Hooks/useLocale";
import { tlgMedium, tsmDemiBold, tsmRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { useEffect, useState } from "react";
import useDebounce from "../Hooks/useDebounce";
import useProgress from "../Hooks/useProgress";
import { usePathname, useSearchParams } from "next/navigation";
import Pagination from "../UI/Pagination";
import SmallAd from "../UI/ListPage/SmallAd";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageIntro from "../UI/ListPage/ListPageIntro";
import BigAd from "../UI/ListPage/BigAd";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import ListPageList from "../UI/ListPage/ListPageList";

export type SymptomsListPageProps = { data: ISymptom[]; pagesCount: number };

const SymptomsListPage = ({ data, pagesCount }: SymptomsListPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce({ initialValue: "" });

  const push = useProgress();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (query) push(`/symptom?search=${query}`);
  }, [query, push]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "علائم", target: "/symptom" },
      ]}
    >
      <ListPageHeader
        title={getContent("symptomsListTitle")}
        legend={getContent("symptomsListLegend")}
      />
      <ListPageIntro
        title={getContent("symptomsListIntroTitle")}
        description={getContent("symptomsListIntroDescription")}
      />
      <BigAd />
      <ListPageSearch
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getContent("searchInSymptoms")}
      />
      <ListPageList
        itemWidth="16.875rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            return `/symptom?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <SymptomCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd />
    </ListPageLayout>
  );
};

export default SymptomsListPage;
