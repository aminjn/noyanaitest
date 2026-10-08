"use client";
import { useSearchParams } from "next/navigation";
import SpecialsBox from "../Clinic/SpecialsBox";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import FlaskIcon from "../Icons/FlaskIcon";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import { IParaClinicCategory } from "../Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageList from "../UI/ListPage/ListPageList";
import ListPageActiveFilters from "../UI/ListPage/ListPageActiveFilters";
import ListPageOpenNowFilter from "../UI/ListPage/ListPageOpenNowFilter";
import { keepListFilters, ListPageFilters } from "../UI/ListPage/listFilters";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import ProPromotion from "../UI/ProPromotion";
import classes from "./ParaClinicsListPage.module.css";
import useDebounce from "../Hooks/useDebounce";
import CentreCard, { CentreTestOffer } from "../UI/CentreCard";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { tbaseMedium, tsmRegular } from "../UI/Typography";
import useProgress from "../Hooks/useProgress";
import { useEffect } from "react";
import SmallAd from "../UI/ListPage/SmallAd";
import Button from "../UI/Button";

const NS: ContentNamespace[] = ["common", "paraClinicsList"];

export type ParaClinicsListPageProps = {
  data: (IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }> & { testOffer?: CentreTestOffer })[];
  // the test the list was opened for (a test card links here): each lab
  // then carries its own price for it
  test?: { _id: string; name?: string; slug?: string } | null;
  pagesCount: number;
  // the tag / insurer the list was opened with (a card chip, an insurer page)
  filters?: ListPageFilters | null;
  categories: IParaClinicCategory[];
  specials: IParaClinic<{ Province: Record<never, never> }>[];
  // how many are open right now (the "open now" chip is offered when some are)
  openNowCount?: number;
};

const SpecialItem = ({
  node,
}: {
  node: IParaClinic<{
    Province: Record<never, never>;
  }>;
}) => {
  return <div>{node.name}</div>;
};

const ParaClinicsListPage = ({
  data,
  pagesCount,
  categories,
  specials,
  filters,
  test,
  openNowCount,
}: ParaClinicsListPageProps) => {
  const getContent = useScopedLocale(NS);

  const searchParams = useSearchParams();

  const [query, setQuery] = useDebounce<string>({
    initialValue: searchParams.get("search") || "",
  });

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    const categories = searchParams.getAll("category");
    for (const cat of categories) params.append("category", cat);
    // the test a test card opened the list for stays (it was dropped, so
    // "which labs do this test" showed every lab)
    const test = searchParams.get("test");
    if (test) params.append("test", test);
    if (searchParams.get("sort") === "best") params.append("sort", "best");
    push(`/paraClinic?${keepListFilters(searchParams, params).toString()}`);
  }, [searchParams, query, push]);

  // "best rated" (2026-10): approved buyer reviews' average, as on the
  // clinic and doctor lists; the default keeps the admin's order
  const bestRated = searchParams.get("sort") === "best";
  const setSort = (best: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (best) params.set("sort", "best");
    else params.delete("sort");
    push(`/paraClinic?${params.toString()}`);
  };

  return (
    <ListPageLayout
      trail={[
        { title: getContent("homePage"), target: "/" },
        { title: getContent("paraClinics"), target: "/paraClinic" },
      ]}
    >
      <ListPageHeader
        title={getContent("noyanParaClinicTitle")}
        legend={getContent("noyanParaClinicLegend")}
      />
      <SmallAd position="paraClinics1" />
      {!!specials.length && (
        <SpecialsBox
          badge={getContent("specialParaClinicsBadge")}
          button={getContent("sepcialParaClinincButton")}
          description={getContent("specialParaClinicsDescription")}
          icon={<FlaskIcon />}
          title={getContent("specialParaClinicsTitle")}
        >
          {specials.map((node) => (
            <SpecialItem key={node._id} node={node} />
          ))}
        </SpecialsBox>
      )}
      <div className={classes.header}>
        <span className={`${classes.title} ${tbaseMedium}`}>
          {test?.name
            ? getContent("labsOfferingTestX", [test.name])
            : getContent("paraClinics")}
        </span>
        <div className={classes.searchBox}>
          <input
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getContent("searchInParaClinics")}
            className={`${classes.input} ${tsmRegular}`}
          />
          <Ixon width="1rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
        </div>
      </div>
      <ListPageCategorySelector
        basePath="/paraClinic"
        categories={categories}
        title={getContent("paraClinicKind")}
      />
      {(Number(openNowCount) > 0 || !!filters?.openNow) && <ListPageOpenNowFilter basePath="/paraClinic" />}
      <ListPageActiveFilters basePath="/paraClinic" filters={filters} />
      <div className={classes.sortBox} role="group" aria-label={getContent("sortBy")}>
        <span className={`${classes.sortLabel} ${tsmRegular}`}>{getContent("sortBy")}</span>
        <Button
          variant={bestRated ? "Disable" : "Primary"}
          mode="Fill"
          size="S"
          radius="High"
          onClick={() => setSort(false)}
        >
          {getContent("labSortSuggested")}
        </Button>
        <Button
          variant={bestRated ? "Primary" : "Disable"}
          mode="Fill"
          size="S"
          radius="High"
          onClick={() => setSort(true)}
        >
          {getContent("labSortBestRated")}
        </Button>
      </div>
      <ListPageList
        itemWidth="24.0625rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            const categories = searchParams.getAll("category");
            for (const cat of categories) params.append("category", cat);
            const test = searchParams.get("test");
            if (test) params.append("test", test);
            if (searchParams.get("sort") === "best") params.append("sort", "best");
            return `/paraClinic?${keepListFilters(searchParams, params).toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {(Array.isArray(data) ? data : []).map((node) => (
          <CentreCard as="li" kind="paraClinic" key={node._id} node={node} offer={test ? node.testOffer : undefined} />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default ParaClinicsListPage;
