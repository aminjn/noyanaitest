"use client";

import { useSearchParams } from "next/navigation";
import { IInsuranceCategory } from "../Admin/InsuranceCategory/AdminManageInsuranceCategoriesPage";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import useDebounce from "../Hooks/useDebounce";
import useLocale from "../Hooks/useLocale";
import ShieldIcon from "../Icons/ShieldIcon";
import Ixon from "../UI/Ixon";
import ListPageCategorySelector from "../UI/ListPage/ListPageCategorySelector";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageSearch from "../UI/ListPage/ListPageSearch";
import classes from "./InsurancesPage.module.css";
import useProgress from "../Hooks/useProgress";
import ListPageList from "../UI/ListPage/ListPageList";
import InsuranceCard from "./InsuranceCard";
import { useEffect } from "react";
import { t2xsRegular, tlgMedium, tsmBold, tsmRegular } from "../UI/Typography";
import Link from "next/link";

export type InsurancesPageNode = IInsurance<{
  Category: Record<never, never>;
  Tags: Record<never, never>;
}>;

export type InsurancesPageProps = {
  data: InsurancesPageNode[];
  totalCount: number;
  pagesCount: number;
  categories: IInsuranceCategory[];
};

const Count = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className={classes.count}>
      <span className={`${classes.countValue} ${tsmBold}`}>{value}</span>
      <span className={`${classes.countTitle} ${t2xsRegular}`}>{title}</span>
    </div>
  );
};

const InsurancesPage = ({
  data,
  pagesCount,
  totalCount,
  categories,
}: InsurancesPageProps) => {
  console.log({ data, pagesCount, totalCount, categories });
  const getContent = useLocale();

  const [query, setQuery] = useDebounce<string>({ initialValue: "" });

  const searchParams = useSearchParams();

  const push = useProgress();

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    const categories = searchParams.getAll("category");
    for (const cat of categories) params.append("category", cat);
    push(`/insurance?${params.toString()}`);
  }, [searchParams, query, push]);

  return (
    <ListPageLayout>
      <div className={classes.header}>
        <div className={classes.headerIntro}>
          <div className={classes.titleBox}>
            <Ixon className={classes.icon} width="1.5rem">
              <ShieldIcon />
            </Ixon>
            <h1 className={`${classes.title} ${tlgMedium}`}>
              {getContent("iranInsurances")}
            </h1>
          </div>
          <p className={`${classes.legend} ${tsmRegular}`}>
            {getContent("insurancesLegend")}
          </p>
        </div>
        <div className={classes.counts}>
          <Count
            value={totalCount.toString()}
            title={getContent("insureresCount")}
          />
          <Count
            value={getContent("totalInsuranceCentersValue")}
            title={getContent("totalInsuranceCenteresTitle")}
          />
          <Count
            value={getContent("totalInsureesCountValue")}
            title={getContent("totalInsureesCountTitle")}
          />
        </div>
      </div>
      <div className={classes.filterBox}>
        <ListPageSearch
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getContent("searchInInsurances")}
          className={classes.search}
        />
        <ListPageCategorySelector
          basePath={"/insurance"}
          categories={categories}
          className={classes.categories}
          noIcon
        />
      </div>
      <ListPageList
        itemWidth="22.8125rem"
        pagination={{
          currentPage: Number(searchParams.get("page")) || 1,
          makePath: (page) => {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            const query = searchParams.get("search");
            if (query) params.append("search", query);
            const categories = searchParams.getAll("category");
            for (const cat of categories) params.append("category", cat);
            return `/insurance?${params.toString()}`;
          },
          pagesCount: pagesCount,
        }}
      >
        {data.map((node) => (
          <InsuranceCard key={node._id} node={node} />
        ))}
      </ListPageList>
    </ListPageLayout>
  );
};

export default InsurancesPage;
