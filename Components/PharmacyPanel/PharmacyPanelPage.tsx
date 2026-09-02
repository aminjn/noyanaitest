"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";

const PharmacyPanelPage = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
  ]);
  return <CurrentLicenseWidget />;
};

export default PharmacyPanelPage;
