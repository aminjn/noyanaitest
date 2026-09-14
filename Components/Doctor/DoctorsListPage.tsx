"use client";

import { DoctorPageProps } from "@/app/doctors/page";
import classes from "./DoctorsListPage.module.css";
import DoctorCard from "./DoctorCard";
import useLocale from "../Hooks/useLocale";
import { Fragment } from "react";
import ListPageList from "../UI/ListPage/ListPageList";
import { useSearchParams } from "next/navigation";
import BreadCrump from "../UI/BreadCrump";

const switchPage = (page: number) => `/doctors?page=${page}`;

const DoctorsListPage = ({ data, pagesCount }: DoctorPageProps) => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const getContent = useLocale();

  return (
    <Fragment>
      <BreadCrump
        trail={[
          { title: getContent("home"), target: "/" },
          { title: getContent("doctors"), target: "/doctors" },
        ]}
        className={classes.crump}
      />
      <h1>{getContent("doctors")}</h1>
      <ListPageList
        itemWidth="14.75rem"
        pagination={{
          currentPage: page,
          makePath: switchPage,
          pagesCount,
        }}
      >
        {data.map((doctor) => (
          <DoctorCard key={doctor._id} node={doctor} />
        ))}
      </ListPageList>
    </Fragment>
  );
};

export default DoctorsListPage;
