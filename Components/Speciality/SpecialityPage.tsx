"use client";

import classes from "./SpecialityPage.module.css";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useLocale from "../Hooks/useLocale";
import Pagination from "../UI/Pagination";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import DoctorCardWithSessions from "../Booking/DoctorCardWithSessions";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";

export type SpecialityPageProps = {
  data: ISpeciality;
  doctors: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
  pagesCount: number;
};

const SpecialityPage = ({ data, doctors, pagesCount }: SpecialityPageProps) => {
  const { page } = useParams<{ page?: string }>();

  const switchPage = useCallback(
    (page: number) => `/speciality/${data.slug || data.name}/${page}`,
    [data.name, data.slug]
  );

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={classes.headerContent}>
          <h1 className={classes.title}>{data.name}</h1>
          {!!data.summary && <p className={classes.summary}>{data.summary}</p>}
        </div>
        <div className={classes.specialityImage}>
          <Image
            alt={data.name || ""}
            src={imagePath(data.image)}
            fill
            sizes="20rem"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
      {!!doctors.length && (
        <div className={classes.contentBox}>
          <legend className={classes.doctorsTitle}>
            {getContent("doctorsWithThisSpeciality")}
          </legend>
          <ul className={classes.list}>
            {doctors.map((node) => (
              <DoctorCardWithSessions node={node} key={node._id} />
            ))}
          </ul>
          <Pagination
            className={classes.center}
            currentPage={Number(page || 1)}
            pagesCount={pagesCount}
            makePath={switchPage}
          />
        </div>
      )}
    </div>
  );
};

export default SpecialityPage;
