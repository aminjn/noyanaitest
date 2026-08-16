"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const InsurancePanelHomePage = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/insurancepanel" },
  ]);
  return <p>InsurancePanelHomePage</p>;
};

export default InsurancePanelHomePage;
