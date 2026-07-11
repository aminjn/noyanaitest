"use client";
import { useSearchParams } from "next/navigation";
import SpecialsBox from "../Clinic/SpecialsBox";
import useLocale from "../Hooks/useLocale";
import FlaskIcon from "../Icons/FlaskIcon";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageList from "../UI/ListPage/ListPageList";
import ProPromotion from "../UI/ProPromotion";
import classes from "./ParaClinicsListPage.module.css";
import useDebounce from "../Hooks/useDebounce";
import ParaClinicCard from "./ParaClinicCard";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import { tbaseMedium, tsmRegular } from "../UI/Typography";
import useProgress from "../Hooks/useProgress";
import { useEffect } from "react";

export type ParaClinicsListPageProps = {
  data: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>[];
  pagesCount: number;
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
  specials,
}: ParaClinicsListPageProps) => {
  const getContent = useLocale();

  const searchParams = useSearchParams();

  const [query, setQuery] = useDebounce<string>({ initialValue: "" });

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    push(`/test?${params.toString()}`);
  }, [query, push]);

  return (
    <ListPageLayout>
      <ListPageHeader
        title={getContent("noyanParaClinicTitle")}
        legend={getContent("noyanParaClinicLegend")}
      />
      <ProPromotion />
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
          {getContent("paraClinics")}
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
      <ListPageList
        itemWidth="24.0625rem"
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
          <ParaClinicCard key={node._id} node={node} />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default ParaClinicsListPage;
