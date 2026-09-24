"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import CurrentLicenseWidget from "./CurrentLicenseWidget";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelHome"];

const ClinicPanelHomePage = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([{ title: getContent("dashboard"), target: "/clinicpanel" }]);
  return <CurrentLicenseWidget />;
};

export default ClinicPanelHomePage;
