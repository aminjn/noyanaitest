"use client";
import { IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import DrugCard from "./DrugCard";
import { ListPage } from "../Disease/DiseasesListPage";

export type DrugsListPageProps = { data: IDrug[]; pagesCount: number };

const switchPage = (page: number) => `/drugs/${page}`;

const DrugsListPage = ({ data, pagesCount }: DrugsListPageProps) => {
  return (
    <ListPage
      title="drugsTitle"
      pagesCount={pagesCount}
      switchPage={switchPage}
    >
      {data.map((node) => (
        <DrugCard key={node._id} node={node} />
      ))}
    </ListPage>
  );
};

export default DrugsListPage;
