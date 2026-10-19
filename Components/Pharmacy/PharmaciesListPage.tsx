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
import PharmacyFilters from "./PharmacyFilters";
import { useIntlLocale } from "../i18n/navigation";
import { tsmDemiBold } from "../UI/Typography";
import classes from "./PharmaciesListPage.module.css";
import { ListPageFilters } from "../UI/ListPage/listFilters";
import CentreCard from "../UI/CentreCard";

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
  // how many are open right now (the "open now" chip is offered when some are)
  openNowCount?: number;
};

// what the list keeps when one filter changes
const KEPT = [
  "search",
  "city",
  "insurance",
  "roundTheClock",
  "openNow",
] as const;

// The pharmacy list (2026-10 redesign after Snapp Pharmacy / Tapsi Dr):
// search on top, the filters in one glass panel beside the results (open
// now, 24 hours, the city, the insurer that pays the prescription - each a
// link, so every view is a crawlable URL), the count and the removable
// chips above the cards (the shared centre card, Components/UI/CentreCard).
const PharmaciesListPage = ({
  data,
  pagesCount,
  count,
  filters,
  cities,
  insurances,
  roundTheClockCount,
  openNowCount,
}: PharmaciesListPageProps) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const searchParams = useSearchParams();
  const push = useProgress();

  const [query, setQuery] = useDebounce<string>({
    initialValue: searchParams.get("search") || "",
  });

  const build = (
    change: Partial<Record<(typeof KEPT)[number] | "page", string | null>>,
  ) => {
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
  const cityList = Array.isArray(cities)
    ? cities.filter((c) => !!c?._id && !!c.name)
    : [];
  const insurerList = Array.isArray(insurances)
    ? insurances.filter((c) => !!c?._id && !!c.name)
    : [];
  const roundTheClock = searchParams.get("roundTheClock") === "1";

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("pharmacies"), target: "/pharmacy" },
      ]}
    >
      <ListPageHeader
        title={getContent("pharmacies")}
        legend={getContent("pharmaciesListLegend")}
      />
      <ListPageSearch
        placeholder={getContent("searchInPharmacies")}
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className={classes.layout}>
        <PharmacyFilters
          cities={cityList}
          insurances={insurerList}
          current={{
            city: searchParams.get("city"),
            insurance: searchParams.get("insurance"),
            roundTheClock,
            openNow: searchParams.get("openNow") === "1",
          }}
          build={build}
          showRoundTheClock={Number(roundTheClockCount) > 0 || roundTheClock}
          showOpenNow={Number(openNowCount) > 0 || !!filters?.openNow}
        />
        <div className={classes.results}>
          <p className={`${classes.count} ${tsmDemiBold}`}>
            {getContent("phFoundCount", [
              new Intl.NumberFormat(intlTag).format(
                Number(count) || list.length,
              ),
            ])}
          </p>
          <ListPageActiveFilters basePath="/pharmacy" filters={filters} />
          <ListPageList
            itemWidth="19.5rem"
            pagination={{
              currentPage: Number(searchParams.get("page")) || 1,
              makePath: (page) => build({ page: String(page) }),
              pagesCount,
            }}
          >
            {list.map((node) => (
              <CentreCard as="li" kind="pharmacy" key={node._id} node={node} />
            ))}
          </ListPageList>
        </div>
      </div>
    </ListPageLayout>
  );
};

export default PharmaciesListPage;
