"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";

const HospitalPanelHomePage = () => {
  const getContent = useLocale();
  useBreadCrump([{ title: getContent("dashboard"), target: "/hospitalpanel" }]);
  return <CurrentLicenseWidget />;
};

export default HospitalPanelHomePage;
