"use client";

import LocationSection from "../Clinic/LocationSection";
import CommentSection from "../Comment/CommentSection";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import ParaClinicAbout from "./ParaClinicAbout";
import ParaClinicIntro from "./ParaClinicIntro";
import ParaClinicNav from "./ParaClinicNav";
import classes from "./ParaClinicPage.module.css";
import ParaClinicTests from "./ParaClinicTests";
import BreadCrump from "../UI/BreadCrump";

export type ParaClinicPageProps = {
  data: IParaClinic<{
    Images: Record<never, never>;
    Province: Record<never, never>;
    District: Record<never, never>;
    City: Record<never, never>;
    Tags: Record<never, never>;
    Tests: { Test: { Category: Record<never, never> } };
    Insurances: Record<never, never>;
  }>;
};

const ParaClinicPage = ({ data }: ParaClinicPageProps) => {
  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: "صفحه اصلی", target: "/" },
          { title: "پاراکلینیک ها", target: "/paraClinic" },
          {
            title: data.name || data._id,
            target: `/paraClinic/${data.slug || data._id}`,
          },
        ]}
        className={classes.crump}
      />
      <ParaClinicIntro data={data} />
      <ParaClinicNav data={data} />
      <ParaClinicTests data={data} />
      <ParaClinicAbout data={data} />
      <LocationSection
        coords={data.location?.coordinates}
        name={data.name}
        address={data.address}
      />
      <div className={classes.comments} id="Comment">
        <CommentSection nodeId={data._id} model="ParaClinic" />
      </div>
    </div>
  );
};

export default ParaClinicPage;
