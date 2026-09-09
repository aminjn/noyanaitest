"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";

const InsurancePanelHomePage = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
  ]);
  return <CurrentLicenseWidget />;
};

export default InsurancePanelHomePage;
