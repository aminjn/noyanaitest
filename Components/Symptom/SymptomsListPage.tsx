"use client";
import { ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import SymptomCard from "./SymptomCard";
import { ListPage } from "../Disease/DiseasesListPage";

export type SymptomsListPageProps = { data: ISymptom[]; pagesCount: number };

const switchPage = (page: number) => `/symptoms/${page}`;

const SymptomsListPage = ({ data, pagesCount }: SymptomsListPageProps) => {
  return (
    <ListPage
      pagesCount={pagesCount}
      switchPage={switchPage}
      title="symptomsTitle"
    >
      {data.map((node) => (
        <SymptomCard key={node._id} node={node} />
      ))}
    </ListPage>
  );
};

export default SymptomsListPage;
