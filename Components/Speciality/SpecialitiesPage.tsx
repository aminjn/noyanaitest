"use client";

import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";

import classes from "./SpecialitiesPage.module.css";
import SpecialityCard from "./SpecialityCard";
import { ListPage } from "../Disease/DiseasesListPage";

export type SpecialitiesPageProps = { data: ISpeciality[]; pagesCount: number };

const switchPage = (page: number) => `/specialities/${page}`;

const SpecialitiesPage = ({ data, pagesCount }: SpecialitiesPageProps) => {
  return (
    <ListPage
      switchPage={switchPage}
      title="SpecialitiesTitle"
      pagesCount={pagesCount}
    >
      {data.map((speciality) => (
        <SpecialityCard key={speciality._id} node={speciality} />
      ))}
    </ListPage>
  );
};

export default SpecialitiesPage;
