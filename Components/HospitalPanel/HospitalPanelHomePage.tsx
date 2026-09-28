"use client";

import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import CurrentLicenseWidget from "./CurrentLicenseWidget";
import CenterHomeInbox from "@/Components/_Common/CenterDoctors/CenterHomeInbox";
import useAcl from "@/Components/Hooks/useAcl";

const NS: ContentNamespace[] = ["common", "hospitalPanelHome"];

const HospitalPanelHomePage = () => {
  const getContent = useScopedLocale(NS);
  useBreadCrump([{ title: getContent("dashboard"), target: "/hospitalpanel" }]);
  // the owner answers join requests here; secretaries only see the license
  const hasAccess = useAcl("hospital");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {hasAccess() && <CenterHomeInbox kind="hospital" />}
      <CurrentLicenseWidget />
    </div>
  );
};

export default HospitalPanelHomePage;
