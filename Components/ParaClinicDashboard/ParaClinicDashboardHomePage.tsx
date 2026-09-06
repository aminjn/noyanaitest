"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";

const ParaClinicDashboardHomePage = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/paraClinicPanel" },
  ]);
  return <CurrentLicenseWidget />;
};

export default ParaClinicDashboardHomePage;
