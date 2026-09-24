import { useEffect, useMemo, useState } from "react";
import { ContentKey } from "../Enums/contentKeys";
import classes from "./ClinicNav.module.css";
import { ClinicPageNode } from "./ClinicPage";
import Button from "../UI/Button";
import StickyNav, { SectionMap } from "./StickyNav";

const ClinicNav = ({ node }: { node: ClinicPageNode }) => {
  const sections = useMemo<SectionMap>(() => {
    const result: SectionMap = [
      { title: "introduction", target: "introduction" },
    ];
    if (node.tags.length)
      result.push({ title: "features", target: "features" });
    result.push({ title: "contactInfo", target: "contact" });
    if (node.departments.length)
      result.push({ title: "departments", target: "departments" });
    if (node.specialities)
      result.push({ title: "specialities", target: "specialities" });
    if (node.services?.length)
      result.push({ title: "service", target: "services" });
    if (node.insurances.length)
      result.push({ title: "insurances", target: "insurances" });
    if (node.doctors.length)
      result.push({ title: "doctors", target: "doctors" });
    if (node.location) result.push({ title: "location", target: "location" });
    result.push({ title: "comments", target: "comments" });
    return result;
  }, [node]);

  return <StickyNav map={sections} />;
};

export default ClinicNav;
