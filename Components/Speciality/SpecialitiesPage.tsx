"use client";

import "swiper/css";

import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";

import classes from "./SpecialitiesPage.module.css";
import SpecialityCard from "./SpecialityCard";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useDebounce from "../Hooks/useDebounce";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import useProgress from "../Hooks/useProgress";
import ListPageList from "../UI/ListPage/ListPageList";
import SmallAd from "../UI/ListPage/SmallAd";

const NS: ContentNamespace[] = ["common", "specialitiesList"];

export type SpecialitiesPageProps = {
  data: ISpeciality<{ Doctors: { Province: Record<never, never> } }>[];
  pagesCount: number;
};

// All specialities in one list (2026-09): no "speciality group" filter - a
// speciality is the only level, and each card opens its doctors.
const SpecialitiesPage = ({ data, pagesCount }: SpecialitiesPageProps) => {
  const getContent = useScopedLocale(NS);

  const searchParams = useSearchParams();
  const [query, setQuery] = useDebounce<string>({
    initialValue: searchParams.get("search") || "",
  });

  const push = useProgress();

  useEffect(() => {
    // only a changed search moves to page 1 of its results
    if ((searchParams.get("search") || "") === query) return;
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    push(`/speciality?${params.toString()}`);
  }, [query, push, searchParams]);

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("specialities"), target: "/speciality" },
      ]}
    >
      <ListPageHeader
        title={getContent("specialitiesListTitle")}
        legend={getContent("specialitiesListLegend")}
      />
      <div className={classes.searchBox}>
        <input
          defaultValue={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getContent("searchInSpecialities")}
          className={classes.searchInput}
        />
        <Ixon width="1.5rem" className={classes.searchIcon}>
          <SearchIcon />
        </Ixon>
      </div>
      <ListPageList
        itemWidth="22.8125rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const search = searchParams.get("search");
            if (search) params.append("search", search);
            return `/speciality?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <SpecialityCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd position="specialities1" />
    </ListPageLayout>
  );
};

export default SpecialitiesPage;
