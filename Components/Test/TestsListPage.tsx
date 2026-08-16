"use client";

import { useSearchParams } from "next/navigation";
import { ITest } from "../Admin/Test/AdminManageTestsPage";
import useDebounce from "../Hooks/useDebounce";
import useLocale from "../Hooks/useLocale";
import BigAd from "../UI/ListPage/BigAd";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageIntro from "../UI/ListPage/ListPageIntro";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import { useEffect } from "react";
import useProgress from "../Hooks/useProgress";
import ListPageList from "../UI/ListPage/ListPageList";
import TestCard from "./TestCard";
import SmallAd from "../UI/ListPage/SmallAd";

export type TestsListPageProps = {
  data: ITest<{ Category: Record<never, never> }>[];
  pagesCount: number;
};

const TestsListPage = ({ data, pagesCount }: TestsListPageProps) => {
  const getContent = useLocale();

  const [query, setQuery] = useDebounce({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    push(`/test?${params.toString()}`);
  }, [query, push]);

  return (
    <ListPageLayout
      trail={[
        { title: "صفحه اصلی", target: "/" },
        { title: "تست ها", target: "/test" },
      ]}
    >
      <ListPageHeader
        title={getContent("testListPageTitle")}
        legend={getContent("testListPageLegend")}
      />
      <ListPageIntro
        title={getContent("testListPageIntroTitle")}
        description={getContent("testListPageIntroDescription")}
      />
      <BigAd position="tests1" />
      <ListPageSearch
        placeholder={getContent("searchInTests")}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ListPageList
        itemWidth="100%"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            return `/test?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <TestCard key={node._id} node={node} />
        ))}
      </ListPageList>
      <SmallAd position="tests2" />
    </ListPageLayout>
  );
};

export default TestsListPage;
