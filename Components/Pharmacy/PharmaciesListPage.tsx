"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useDebounce from "../Hooks/useDebounce";
import useProgress from "../Hooks/useProgress";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import ListPageList from "../UI/ListPage/ListPageList";
import ListPageActiveFilters from "../UI/ListPage/ListPageActiveFilters";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import ListPageHeaderToggle from "../UI/ListPage/ListPageHeaderToggle";
import { ListPageFilters } from "../UI/ListPage/listFilters";
import ParaClinicCard from "../ParaClinic/ParaClinicCard";

const NS: ContentNamespace[] = ["common", "pharmaciesList"];

type Named = { _id: string; name?: string; slug?: string };

export type PharmaciesListPageProps = {
  data: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  pagesCount: number;
  // how many pharmacies match (all pages)
  count?: number;
  filters?: (ListPageFilters & { roundTheClock?: boolean }) | null;
  // the facets some pharmacy has (a city or insurer with none is not offered)
  cities?: Named[];
  insurances?: Named[];
  roundTheClockCount?: number;
};

// what the list keeps when one filter changes
const KEPT = ["search", "city", "insurance", "roundTheClock"] as const;

// The pharmacy list (2026-10), like the clinic and lab lists: search, the
// 24-hour switch, the insurer that pays the prescription and the city, each
// a link (so every view is a crawlable URL) and a removable chip. The cards
// are the shared centre card (Components/ParaClinic/ParaClinicCard).
const PharmaciesListPage = ({
  data,
  pagesCount,
  count,
  filters,
  cities,
  insurances,
  roundTheClockCount,
}: PharmaciesListPageProps) => {
  const getContent = useScopedLocale(NS);
  const searchParams = useSearchParams();
  const push = useProgress();

  const [query, setQuery] = useDebounce<string>({
    initialValue: searchParams.get("search") || "",
  });

  const build = (change: Partial<Record<(typeof KEPT)[number] | "page", string | null>>) => {
    const params = new URLSearchParams();
    for (const key of KEPT) {
      const value = key in change ? change[key] : searchParams.get(key);
      if (value) params.append(key, value);
    }
    if (change.page) params.append("page", change.page);
    const q = params.toString();
    return q ? `/pharmacy?${q}` : "/pharmacy";
  };

  useEffect(() => {
    if ((searchParams.get("search") || "") === query) return;
    push(build({ search: query || null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const list = Array.isArray(data) ? data.filter((el) => !!el?._id) : [];
  const cityList = Array.isArray(cities) ? cities.filter((c) => !!c?._id && !!c.name) : [];
  const insurerList = Array.isArray(insurances) ? insurances.filter((c) => !!c?._id && !!c.name) : [];
  const roundTheClock = searchParams.get("roundTheClock") === "1";

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("pharmacies"), target: "/pharmacy" },
      ]}
    >
      <ListPageHeader title={getContent("pharmacies")} legend={getContent("pharmaciesListLegend")} />
      <ListPageSearch
        placeholder={getContent("searchInPharmacies")}
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => setQuery(e.target.value)}
      />
      {(Number(roundTheClockCount) > 0 || roundTheClock) && (
        <ListPageHeaderToggle
          count={Number(count) || list.length}
          active={roundTheClock}
          label={getContent("roundTheClock")}
          onChange={() => push(build({ roundTheClock: roundTheClock ? null : "1", page: null }))}
        />
      )}
      {cityList.length > 1 && (
        <ListPageCategorySelector
          basePath="/pharmacy"
          title={getContent("city")}
          categories={cityList}
          hrefOf={(c) => build({ city: c._id })}
          isActive={(c) => c._id === searchParams.get("city")}
          allHref={build({ city: null })}
          allActive={!searchParams.get("city")}
        />
      )}
      {!!insurerList.length && (
        <ListPageCategorySelector
          basePath="/pharmacy"
          title={getContent("insurance")}
          categories={insurerList}
          hrefOf={(c) => build({ insurance: c._id })}
          isActive={(c) => c._id === searchParams.get("insurance")}
          allHref={build({ insurance: null })}
          allActive={!searchParams.get("insurance")}
        />
      )}
      <ListPageActiveFilters basePath="/pharmacy" filters={filters} />
      <ListPageList
        itemWidth="24.0625rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => build({ page: String(page) }),
          pagesCount,
        }}
      >
        {list.map((node) => (
          <ParaClinicCard key={node._id} node={node} kind="pharmacy" />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default PharmaciesListPage;
