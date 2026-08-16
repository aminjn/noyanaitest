"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const ClinicPanelHomePage = () => {
  const getContent = useLocale();
  useBreadCrump([{ title: getContent("dashboard"), target: "/clinicpanel" }]);
  return <p>ClinicPanelHomePage</p>;
};

export default ClinicPanelHomePage;
