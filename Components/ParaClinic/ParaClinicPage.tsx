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
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

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
  // false: the lab's plan has no online orders - its tests are shown with
  // prices but not sold here (the cart would refuse them)
  takesOrders?: boolean;
};

const ParaClinicPage = ({ data, takesOrders }: ParaClinicPageProps) => {
  const getContent = useScopedLocale();
  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: getContent("homePage"), target: "/" },
          { title: getContent("paraClinics"), target: "/paraClinic" },
          {
            title: data.name || data._id,
            target: `/paraClinic/${data.slug || data._id}`,
          },
        ]}
        className={classes.crump}
      />
      <ParaClinicIntro data={data} takesOrders={takesOrders} />
      <ParaClinicNav data={data} />
      <ParaClinicTests data={data} takesOrders={takesOrders} />
      <ParaClinicAbout data={data} />
      <LocationSection
        className={classes.location}
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
