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
import { keepListFilters, ListPageFilters } from "../UI/ListPage/listFilters";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import ProPromotion from "../UI/ProPromotion";
import classes from "./ParaClinicsListPage.module.css";
import useDebounce from "../Hooks/useDebounce";
import ParaClinicCard, { ParaClinicTestOffer } from "./ParaClinicCard";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { tbaseMedium, tsmRegular } from "../UI/Typography";
import useProgress from "../Hooks/useProgress";
import { useEffect } from "react";
import SmallAd from "../UI/ListPage/SmallAd";

const NS: ContentNamespace[] = ["common", "paraClinicsList"];

export type ParaClinicsListPageProps = {
  data: (IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }> & { testOffer?: ParaClinicTestOffer })[];
  // the test the list was opened for (a test card links here): each lab
  // then carries its own price for it
  test?: { _id: string; name?: string; slug?: string } | null;
  pagesCount: number;
  // the tag / insurer the list was opened with (a card chip, an insurer page)
  filters?: ListPageFilters | null;
  categories: IParaClinicCategory[];
  specials: IParaClinic<{ Province: Record<never, never> }>[];
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
    push(`/paraClinic?${keepListFilters(searchParams, params).toString()}`);
  }, [searchParams, query, push]);

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
      <ListPageActiveFilters basePath="/paraClinic" filters={filters} />
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
            return `/paraClinic?${keepListFilters(searchParams, params).toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {(Array.isArray(data) ? data : []).map((node) => (
          <ParaClinicCard key={node._id} node={node} offer={test ? node.testOffer : undefined} />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default ParaClinicsListPage;
