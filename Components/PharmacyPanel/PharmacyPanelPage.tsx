"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const PharmacyPanelPage = () => {
  const getContent = useLocale();
  useBreadCrump([
    { title: getContent("dashboard"), target: "/pharmacypanel" },
  ]);
  return <p>PharmacyPanelPage</p>;
};

export default PharmacyPanelPage;
