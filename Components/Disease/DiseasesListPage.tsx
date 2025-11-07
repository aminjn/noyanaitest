"use client";
import { useParams } from "next/navigation";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import useLocale from "../Hooks/useLocale";
import Pagination, { PagePathMaker } from "../UI/Pagination";
import classes from "./DiseasesListPage.module.css";
import DiseaseCard from "./DiseaseCard";
import { ReactNode } from "react";
import { ContentKey } from "../Enums/contentKeys";

export const ListPage = ({
  children,
  title,
  pagesCount,
  switchPage,
}: {
  children?: ReactNode;
  title: ContentKey;
  pagesCount: number;
  switchPage: PagePathMaker;
}) => {
  const { page } = useParams<{ page: string }>();
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <h1 className={classes.title}>{getContent(title)}</h1>
      <div className={classes.content}>
        <ul className={classes.list}>{children}</ul>
        <Pagination
          className={classes.center}
          pagesCount={pagesCount}
          currentPage={Number(page || 1)}
          makePath={switchPage}
        />
      </div>
    </div>
  );
};

const switchPage = (page: number) => `/diseases/${page}`;

export type DiseasesListPageProps = { data: IDisease[]; pagesCount: number };
const DiseasesListPage = ({ data, pagesCount }: DiseasesListPageProps) => {
  return (
    <ListPage
      switchPage={switchPage}
      title="diseasesTitle"
      pagesCount={pagesCount}
    >
      {data.map((node) => (
        <DiseaseCard key={node._id} node={node} />
      ))}
    </ListPage>
  );
};

export default DiseasesListPage;
