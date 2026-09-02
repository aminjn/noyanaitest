"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";

const ClinicPanelHomePage = () => {
  const getContent = useLocale();
  useBreadCrump([{ title: getContent("dashboard"), target: "/clinicpanel" }]);
  return <CurrentLicenseWidget />;
};

export default ClinicPanelHomePage;
