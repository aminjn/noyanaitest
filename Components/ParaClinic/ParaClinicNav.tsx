import { useMemo } from "react";
import StickyNav, { SectionMap } from "../Clinic/StickyNav";
import classes from "./ParaClinicNav.module.css";
import { ParaClinicPageProps } from "./ParaClinicPage";

const ParaClinicNav = ({ data }: ParaClinicPageProps) => {
  const sections = useMemo<SectionMap>(() => {
    const result: SectionMap = [];
    if (data.tests.length)
      result.push({ title: "servicesAndTests", target: "Tests" });
    result.push({ title: "aboutParaCinic", target: "About" });
    if (data.location?.coordinates)
      result.push({ title: "map", target: "location" });
    result.push({ title: "usersComments", target: "Comment" });
    return result;
  }, [data]);

  return <StickyNav map={sections} />;
};

export default ParaClinicNav;
