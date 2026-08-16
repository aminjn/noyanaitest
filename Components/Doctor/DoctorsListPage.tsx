"use client";

import { DoctorPageProps } from "@/app/doctors/[page]/page";
import classes from "./DoctorsListPage.module.css";
import DoctorCard from "./DoctorCard";
import { ListPage } from "../Disease/DiseasesListPage";
import WithSideMap from "../Booking/WithSideMap";
import useLocale from "../Hooks/useLocale";
import { Fragment } from "react";
import DoctorsCardList from "../Booking/DoctorsCardList";
import DoctorCardWithSessions from "../Booking/DoctorCardWithSessions";
import Pagination from "../UI/Pagination";
import { useParams } from "next/navigation";
import BreadCrump from "../UI/BreadCrump";

const switchPage = (page: number) => `/doctors/${page}`;

const DoctorsListPage = ({ data, profiles, pagesCount }: DoctorPageProps) => {
  console.log(profiles);

  const { page } = useParams<{ page: string }>();

  const getContent = useLocale();

  return (
    <WithSideMap>
      <Fragment>
        <BreadCrump
          trail={[
            { title: "صفحه اصلی", target: "/" },
            { title: "پزشکان", target: "/doctors" },
          ]}
          className={classes.crump}
        />
        <h1>{getContent("doctors")}</h1>
        <DoctorsCardList>
          {profiles.map((profile) => (
            <DoctorCardWithSessions key={profile._id} node={profile} />
          ))}
          {data.map((doctor) => (
            <DoctorCard key={doctor._id} node={doctor} />
          ))}
        </DoctorsCardList>
        <Pagination
          className={classes.pagination}
          currentPage={Number(page) || 1}
          makePath={switchPage}
          pagesCount={pagesCount}
        />
      </Fragment>
    </WithSideMap>
    // <ListPage
    //   title="doctorsListTitle"
    //   switchPage={switchPage}
    //   pagesCount={pagesCount}
    // >
    //   {data.map((doctor) => (
    //     <DoctorCard key={doctor._id} node={doctor} />
    //   ))}
    // </ListPage>
  );
};

export default DoctorsListPage;
