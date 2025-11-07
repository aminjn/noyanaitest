"use client";

import Image from "next/image";
import { IDoctor } from "../Admin/Doctor/AdminManageDoctorsPage";

import classes from "./DoctorPage.module.css";
import { imagePath } from "../helpers/imagepath";
import useLocale from "../Hooks/useLocale";

export type DoctorPageProps = {
  data: IDoctor<{ SpecialityPopulated: Record<never, never> }>;
};

const DoctorPage = ({ data }: DoctorPageProps) => {
  console.log(data);

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <h1 className={classes.title}>{data.name}</h1>
      <div className={classes.image}>
        <Image
          alt={data.name || ""}
          src={imagePath(data.image)}
          fill
          sizes="40rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.content}>
        <legend className={classes.detailTitle} >{getContent("details")}</legend>
        {data.address && <p>{data.address}</p>}
        {data.description && <p>{data.description}</p>}
        {data.hours && <p>{data.hours}</p>}
        {data.landLine && <p>{data.landLine}</p>}
        {data.mobile && <p>{data.mobile}</p>}
      </div>
    </div>
  );
};

export default DoctorPage;
