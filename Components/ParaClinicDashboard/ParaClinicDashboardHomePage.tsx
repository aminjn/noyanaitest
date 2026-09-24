"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import CurrentLicenseWidget from "./CurrentLicenseWidget";

const NS: ContentNamespace[] = ["common", "paraClinicPanelHome"];

const ParaClinicDashboardHomePage = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([
    { title: getContent("dashboard"), target: "/paraClinicPanel" },
  ]);
  return <CurrentLicenseWidget />;
};

export default ParaClinicDashboardHomePage;
